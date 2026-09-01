import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntry } from "@/lib/audit";

/**
 * Explicit "view sensitive content" action for NCII/minor-flagged evidence
 * (PS4_MVP_BUILD_PLAN.md §2 — thumbnails/media blur by default for these,
 * "revealed only via an explicit action that itself writes an
 * AuditLogEntry"). Doesn't return the file itself (the client already has
 * the /file URL — this just authorizes and logs the reveal); the frontend
 * calls this before un-blurring, not instead of the /file route.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const entry = await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "VIEWED",
    device: `${request.headers.get("user-agent") ?? "unknown"} (sensitive-content-reveal)`,
  });
  appendCheckpoint(entry);

  return NextResponse.json({ ok: true });
}
