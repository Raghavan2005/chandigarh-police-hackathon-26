import { createHash } from "crypto";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type DbOrTx = typeof db | Prisma.TransactionClient;

// storage/ lives inside police-evidence-platform/ (alongside package.json),
// which is process.cwd() when the Next.js server is running — no ".." here.
const CHECKPOINT_PATH = path.join(process.cwd(), "storage", "audit-checkpoints.log");

/**
 * Whether storage/audit-checkpoints.log actually has the append-only
 * attribute — checked once per process, not assumed. §11 flagged this as
 * "verify on the real demo hardware, don't assume ext4/xfs support it," and
 * that turned out to matter: on this dev machine `chattr +a` exits 0 without
 * throwing but the attribute doesn't actually land (confirmed via `lsattr`
 * — a plain shell redirect can still truncate the file). Trusting a zero
 * exit code here would have silently produced a false sense of tamper-
 * hardening, so this reads the attribute back rather than trusting the
 * command's exit status.
 */
let checkpointFileHardened: boolean | null = null;

/**
 * Ensures the checkpoint file exists and, best-effort, has the Linux
 * append-only attribute set (PS4_MVP_BUILD_PLAN.md §2) — even the app's own
 * service account can then only append to it, never rewrite or truncate
 * prior entries. When the attribute doesn't actually take (this filesystem,
 * or non-Linux), falls back to also mirroring every checkpoint line to
 * syslog via `logger` (see appendCheckpoint) — journald's storage isn't
 * writable by this process at all, which is a genuinely separate write
 * path outside the app's own filesystem access, not just a second copy of
 * the same vulnerable file.
 */
function ensureCheckpointFile() {
  if (!existsSync(CHECKPOINT_PATH)) {
    writeFileSync(CHECKPOINT_PATH, "", { flag: "a" });
    try {
      execFileSync("chattr", ["+a", CHECKPOINT_PATH]);
    } catch {
      // fall through — verified below regardless of whether this threw
    }
  }

  if (checkpointFileHardened === null) {
    try {
      const attrs = execFileSync("lsattr", [CHECKPOINT_PATH]).toString();
      checkpointFileHardened = attrs.split(" ")[0]?.includes("a") ?? false;
    } catch {
      checkpointFileHardened = false;
    }
    if (!checkpointFileHardened) {
      console.warn(
        `[audit] append-only attribute is NOT active on ${CHECKPOINT_PATH} — ` +
          "chattr unavailable, unsupported by this filesystem, or silently a no-op here. " +
          "Falling back to mirroring checkpoints via syslog (logger) as the tamper-hardening " +
          "layer instead. See PS4_MVP_BUILD_PLAN.md §11.",
      );
    }
  }
}

export type AuditAction =
  | "UPLOADED"
  | "ANALYZED"
  | "VIEWED"
  | "OVERRIDDEN"
  | "EXPORTED"
  | "ASSIGNED"
  | "CUSTODY_TRANSFERRED";

interface WriteAuditEntryInput {
  caseId: string;
  evidenceHash?: string;
  actorId?: string;
  action: AuditAction;
  device?: string;
}

/**
 * The DB-only half of writing an audit entry: reads the most recent entry
 * (by autoincrement id — see schema.prisma's note on why AuditLogEntry uses
 * an int id, not cuid) for prevEntryHash, computes entryHash, inserts the
 * row. Takes a transaction client so it can be called from inside the same
 * `db.$transaction` as the case/evidence write it's auditing — e.g. a case
 * row and its "ASSIGNED" entry either both commit or neither does. There is
 * no such thing as evidence existing in the DB with no audit trail for it.
 *
 * Does NOT touch the checkpoint file — a filesystem append can't
 * participate in a SQL transaction, so that happens in the non-transactional
 * wrapper below, after the DB transaction has already committed.
 */
async function writeAuditEntryDb(input: WriteAuditEntryInput, tx: DbOrTx) {
  const prev = await tx.auditLogEntry.findFirst({ orderBy: { id: "desc" } });
  const prevEntryHash = prev?.entryHash ?? null;
  const timestamp = new Date();

  const entryHash = createHash("sha256")
    .update(
      JSON.stringify({
        prevEntryHash,
        caseId: input.caseId,
        evidenceHash: input.evidenceHash ?? null,
        actorId: input.actorId ?? null,
        action: input.action,
        device: input.device ?? null,
        timestamp: timestamp.toISOString(),
      }),
    )
    .digest("hex");

  return tx.auditLogEntry.create({
    data: {
      caseId: input.caseId,
      evidenceHash: input.evidenceHash,
      actorId: input.actorId,
      action: input.action,
      device: input.device,
      timestamp,
      entryHash,
      prevEntryHash,
    },
  });
}

function appendCheckpoint(entry: { id: number; entryHash: string; timestamp: Date }) {
  ensureCheckpointFile();
  const line = `${entry.id}\t${entry.entryHash}\t${entry.timestamp.toISOString()}`;
  appendFileSync(CHECKPOINT_PATH, line + "\n");

  if (!checkpointFileHardened) {
    // Best-effort, fire-and-forget — a slow/missing syslog daemon must never
    // block or fail the request this checkpoint is attached to. journald's
    // own storage isn't writable by this process, which is the actual
    // property being relied on here (§2/§11) — not that syslog is fancier.
    try {
      execFileSync("logger", ["-t", "ps4-audit-checkpoint", line]);
    } catch {
      console.warn(`[audit] syslog fallback also unavailable — checkpoint ${entry.id} only recorded in-file.`);
    }
  }
}

/**
 * Standalone version — DB write + checkpoint-file append in one call, for
 * actions that aren't already inside a transaction with something else
 * (e.g. VIEWED, which has nothing else to be atomic with).
 */
export async function writeAuditEntry(input: WriteAuditEntryInput) {
  const entry = await writeAuditEntryDb(input, db);
  appendCheckpoint(entry);
  return entry;
}

/**
 * Transactional version — pass the same `tx` you're using to create/update
 * the case or evidence row, so the write and its audit entry commit
 * together or not at all. Caller must call `appendCheckpoint` with the
 * returned entry once the outer transaction has committed (the checkpoint
 * file can't be part of the SQL transaction, but it should still happen
 * right after, not be forgotten).
 */
export async function writeAuditEntryInTx(input: WriteAuditEntryInput, tx: Prisma.TransactionClient) {
  return writeAuditEntryDb(input, tx);
}

/**
 * Reads storage/audit-checkpoints.log back into { id -> entryHash }, for
 * cross-checking against the DB (PS4_MVP_BUILD_PLAN.md §5: "every entry's
 * entryHash/prevEntryHash must be... cross-checkable against
 * storage/audit-checkpoints.log, not just stored"). This is the actual
 * point of a separate checkpoint file: internal DB chain verification
 * alone (each row's prevEntryHash matching the prior row's entryHash)
 * cannot catch a full, self-consistent rewrite of the DB after the fact —
 * whoever rewrote it could recompute every downstream hash to still chain
 * correctly. The checkpoint file is a second, independently-written record
 * of what entryHash each id had at the moment it was created, so a DB row
 * that now disagrees with its own checkpoint line is caught regardless of
 * whether the rest of the DB chain still looks internally consistent.
 */
export function readCheckpoints(): Map<number, string> {
  const checkpoints = new Map<number, string>();
  if (!existsSync(CHECKPOINT_PATH)) return checkpoints;

  const lines = readFileSync(CHECKPOINT_PATH, "utf8").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const [idStr, entryHash] = line.split("\t");
    const id = Number(idStr);
    if (Number.isFinite(id) && entryHash) checkpoints.set(id, entryHash);
  }
  return checkpoints;
}

export { appendCheckpoint };
