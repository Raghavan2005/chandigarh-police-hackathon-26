import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Streams the real Grad-CAM heatmap PNG written by /investigate — 404s
 * plainly if detection hasn't run yet, rather than serving a placeholder
 * image that would misrepresent an un-analyzed file as having one. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { detectionResult: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  if (!evidence.detectionResult?.heatmapPath) {
    return NextResponse.json({ error: "No heatmap available — detection hasn't run on this file yet." }, { status: 404 });
  }

  const buffer = await readFile(resolveEvidencePath(evidence.detectionResult.heatmapPath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
