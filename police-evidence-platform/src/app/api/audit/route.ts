import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { getAuditLog } from "@/lib/audit-server";

/**
 * GET /api/audit — named explicitly in PS4_MVP_BUILD_PLAN.md §5. Admin-only
 * (same role gate as the /audit page, §2), returns every entry plus the
 * same two-layer chain verification the page shows: internal DB linkage,
 * and cross-checked against storage/audit-checkpoints.log — "every entry's
 * entryHash/prevEntryHash must be independently re-verifiable... and
 * cross-checkable against the checkpoint log, not just stored."
 */
export async function GET() {
  const session = await requireRole("admin");
  if (session instanceof NextResponse) return session;

  const { entries, verification } = await getAuditLog();

  return NextResponse.json({
    verification,
    entries: entries.map((e) => ({
      id: e.id,
      caseId: e.caseId,
      evidenceHash: e.evidenceHash,
      actor: e.actor?.name ?? null,
      action: e.action,
      timestamp: e.timestamp,
      device: e.device,
      entryHash: e.entryHash,
      prevEntryHash: e.prevEntryHash,
    })),
  });
}
