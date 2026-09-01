import { createHash } from "crypto";
import { appendFileSync, existsSync, writeFileSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { db } from "@/lib/db";

const CHECKPOINT_PATH = path.join(process.cwd(), "..", "storage", "audit-checkpoints.log");

/**
 * Ensures the checkpoint file exists and has the Linux append-only attribute
 * set (PS4_MVP_BUILD_PLAN.md §2) — even the app's own service account can
 * then only append to it, never rewrite or truncate prior entries. Removing
 * the attribute requires root and is itself an auditable OS-level action.
 * Best-effort: if `chattr` isn't available (non-Linux, or the filesystem
 * doesn't support the attribute — e.g. not ext4/xfs), the file still gets
 * created and appended to, just without that extra hardening layer — see
 * PS4_MVP_BUILD_PLAN.md §11's open question on verifying this on the real
 * demo hardware.
 */
function ensureCheckpointFile() {
  if (!existsSync(CHECKPOINT_PATH)) {
    writeFileSync(CHECKPOINT_PATH, "", { flag: "a" });
    try {
      execFileSync("chattr", ["+a", CHECKPOINT_PATH]);
    } catch {
      console.warn(
        `[audit] could not set append-only attribute on ${CHECKPOINT_PATH} — ` +
          "chattr unavailable or filesystem doesn't support it. Checkpoint file " +
          "still active, just without OS-level tamper-hardening. See PS4_MVP_BUILD_PLAN.md §11.",
      );
    }
  }
}

export type AuditAction = "UPLOADED" | "ANALYZED" | "VIEWED" | "OVERRIDDEN" | "EXPORTED" | "ASSIGNED";

interface WriteAuditEntryInput {
  caseId: string;
  evidenceHash?: string;
  actorId?: string;
  action: AuditAction;
  device?: string;
}

/**
 * Writes one entry to the hash-chained, append-only audit log
 * (PS4_MVP_BUILD_PLAN.md §1 item 10, §4). Every call:
 *  1. Reads the most recent entry (by autoincrement id — see schema.prisma's
 *     note on why AuditLogEntry uses an int id, not cuid) to get prevEntryHash.
 *  2. Computes entryHash = sha256(prevEntryHash + the new entry's fields).
 *  3. Inserts the row.
 *  4. Mirrors entryHash to storage/audit-checkpoints.log outside the DB file,
 *     so a later diff between "recompute the chain from the DB" and "what the
 *     checkpoint file recorded" can pinpoint tampering (§2).
 *
 * Not wrapped in a DB transaction with the checkpoint-file append (the file
 * write can't participate in a SQL transaction) — for the MVP timeline this
 * is an accepted gap, not an oversight: the DB row is the source of truth,
 * the checkpoint file is corroborating evidence, and a mismatch between the
 * two is itself the tamper signal the design relies on.
 */
export async function writeAuditEntry(input: WriteAuditEntryInput) {
  const prev = await db.auditLogEntry.findFirst({ orderBy: { id: "desc" } });
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

  const entry = await db.auditLogEntry.create({
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

  ensureCheckpointFile();
  appendFileSync(CHECKPOINT_PATH, `${entry.id}\t${entryHash}\t${timestamp.toISOString()}\n`);

  return entry;
}
