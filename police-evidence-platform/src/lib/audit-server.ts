import "server-only";
import { db } from "@/lib/db";
import { readCheckpoints } from "@/lib/audit";

export interface ChainVerification {
  intact: boolean;
  totalEntries: number;
  brokenAtId: number | null;
  checkpointMismatchIds: number[];
  checkpointMissingIds: number[];
}

/** Global audit trail across every case — not case-scoped, matching
 * design.md's "dense mono-font table... deliberately boring and complete"
 * spec for this screen. Admin-only per PS4_MVP_BUILD_PLAN.md §2's
 * authorization note ("only admin can view the global audit log").
 *
 * Recomputes the hash chain over the FULL history (not just the displayed
 * page) two ways, per §5: internal DB chain linkage (each entry's
 * prevEntryHash against the prior entry's entryHash), AND cross-checked
 * against storage/audit-checkpoints.log — the latter is what actually
 * catches a self-consistent rewrite of the whole DB chain, which internal
 * checking alone cannot (see readCheckpoints in lib/audit.ts).
 */
export async function getAuditLog(): Promise<{ entries: Awaited<ReturnType<typeof fetchAll>>; verification: ChainVerification }> {
  const entries = await fetchAll();
  const checkpoints = readCheckpoints();

  let intact = true;
  let brokenAtId: number | null = null;
  const checkpointMismatchIds: number[] = [];
  const checkpointMissingIds: number[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const expectedPrev = i === 0 ? null : entries[i - 1].entryHash;
    if (intact && entry.prevEntryHash !== expectedPrev) {
      intact = false;
      brokenAtId = entry.id;
    }

    const checkpointHash = checkpoints.get(entry.id);
    if (checkpointHash === undefined) {
      checkpointMissingIds.push(entry.id);
    } else if (checkpointHash !== entry.entryHash) {
      checkpointMismatchIds.push(entry.id);
    }
  }

  return {
    entries: [...entries].reverse(), // most-recent-first for display
    verification: {
      intact: intact && checkpointMismatchIds.length === 0,
      totalEntries: entries.length,
      brokenAtId,
      checkpointMismatchIds,
      checkpointMissingIds,
    },
  };
}

function fetchAll() {
  return db.auditLogEntry.findMany({
    orderBy: { id: "asc" },
    include: { actor: { select: { name: true } } },
  });
}
