import "server-only";
import { db } from "@/lib/db";

export interface ChainVerification {
  intact: boolean;
  totalEntries: number;
  brokenAtId: number | null;
}

/** Global audit trail across every case — not case-scoped, matching
 * design.md's "dense mono-font table... deliberately boring and complete"
 * spec for this screen. Admin-only per PS4_MVP_BUILD_PLAN.md §2's
 * authorization note ("only admin can view the global audit log").
 *
 * Also recomputes the hash chain over the FULL history (not just the
 * displayed page) to actually verify prevEntryHash linkage end to end —
 * per §2, "recompute the hash chain from the DB and diff it against the
 * checkpoint file — any mismatch pinpoints exactly which entry was altered
 * after the fact." This does the DB-side half of that check; diffing
 * against storage/audit-checkpoints.log is a manual follow-up, not
 * something this page automates yet.
 */
export async function getAuditLog(): Promise<{ entries: Awaited<ReturnType<typeof fetchAll>>; verification: ChainVerification }> {
  const entries = await fetchAll();

  let intact = true;
  let brokenAtId: number | null = null;
  for (let i = 0; i < entries.length; i++) {
    const expectedPrev = i === 0 ? null : entries[i - 1].entryHash;
    if (entries[i].prevEntryHash !== expectedPrev) {
      intact = false;
      brokenAtId = entries[i].id;
      break;
    }
  }

  return {
    entries: [...entries].reverse(), // most-recent-first for display
    verification: { intact, totalEntries: entries.length, brokenAtId },
  };
}

function fetchAll() {
  return db.auditLogEntry.findMany({
    orderBy: { id: "asc" },
    include: { actor: { select: { name: true } } },
  });
}
