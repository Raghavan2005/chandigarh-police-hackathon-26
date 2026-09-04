import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { getRequestIp } from "@/lib/request-ip";
import { db } from "@/lib/db";
import { renderPageToPdf } from "@/lib/pdf";

/**
 * GET /api/cases/:id/report.pdf — the actual named PS4_MVP_BUILD_PLAN.md §5
 * endpoint, and Phase 3's "Puppeteer PDF render quality" item. Real
 * server-rendered PDF, not window.print() (which nothing server-side can
 * verify happened correctly) — navigates a headless Chrome to the same
 * report page a human sees, carrying the caller's own session cookie so
 * the render is authenticated and shows real data, and writes a real
 * EXPORTED audit entry same as the JSON export.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId } = await params;
  const exists = await db.case.findUnique({ where: { id: caseId }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const reportUrl = `${origin}/cases/${caseId}/report`;

  let pdf: Buffer;
  try {
    pdf = await renderPageToPdf(reportUrl, request.headers.get("cookie"));
  } catch (error) {
    console.error(`[report.pdf] render failed for case ${caseId}:`, error);
    return NextResponse.json(
      { error: "PDF render failed — check server logs (likely no Chrome/Chromium executable found)." },
      { status: 500 },
    );
  }

  await writeAuditEntry({
    caseId,
    actorId: session.userId,
    action: "EXPORTED",
    device: request.headers.get("user-agent") ?? undefined,
    ipAddress: getRequestIp(request) ?? undefined,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${caseId}-evidence-report.pdf"`,
    },
  });
}
