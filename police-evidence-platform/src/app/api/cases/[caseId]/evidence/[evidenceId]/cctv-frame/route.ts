import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Streams one real sampled CCTV frame image, selected by `?frame=N`
 * (frameIndex) — written by /detect-cctv. 404s plainly if detection
 * hasn't run yet or the index is out of range, rather than serving a
 * placeholder that would misrepresent an un-analyzed file as having one. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const frameParam = request.nextUrl.searchParams.get("frame");
  const frameIndex = frameParam ? Number.parseInt(frameParam, 10) : NaN;
  if (!Number.isInteger(frameIndex)) {
    return NextResponse.json({ error: "?frame=N (frame index) is required." }, { status: 400 });
  }

  const sample = await db.cctvFrameSample.findUnique({
    where: { evidenceId_frameIndex: { evidenceId, frameIndex } },
  });
  if (!sample) {
    return NextResponse.json(
      { error: "No sampled frame at that index — run CCTV detection first, or the index is out of range." },
      { status: 404 },
    );
  }

  const buffer = await readFile(resolveEvidencePath(sample.imagePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" },
  });
}
