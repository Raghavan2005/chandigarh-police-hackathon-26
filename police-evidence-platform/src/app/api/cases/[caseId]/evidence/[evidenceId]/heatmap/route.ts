import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Streams a real Grad-CAM heatmap PNG written by /investigate — 404s
 * plainly if detection hasn't run yet, rather than serving a placeholder
 * image that would misrepresent an un-analyzed file as having one.
 *
 * `?frame=N` serves that sampled video frame's own heatmap
 * (`frameHeatmapPathsJson[N]`) instead of the single worst-scoring frame's
 * heatmap (`heatmapPath`, the default) — every sampled frame gets a real
 * heatmap computed today, this just stops discarding the rest. Falls back
 * to the default heatmap on an out-of-range/missing index rather than
 * 404ing the whole request over a bad query param. */
export async function GET(
  request: NextRequest,
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

  const frameParam = request.nextUrl.searchParams.get("frame");
  let relativePath = evidence.detectionResult?.heatmapPath ?? null;
  if (frameParam !== null && evidence.detectionResult?.frameHeatmapPathsJson) {
    const index = Number(frameParam);
    try {
      const framePaths: string[] = JSON.parse(evidence.detectionResult.frameHeatmapPathsJson);
      if (Number.isInteger(index) && framePaths[index]) {
        relativePath = framePaths[index];
      }
    } catch {
      // fall through to the default heatmapPath already set above
    }
  }

  if (!relativePath) {
    return NextResponse.json({ error: "No heatmap available — detection hasn't run on this file yet." }, { status: 404 });
  }

  const buffer = await readFile(resolveEvidencePath(relativePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
