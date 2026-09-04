import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Streams the real pixel-diff overlay PNG written by POST .../video-diff —
 * 404s plainly if a diff hasn't been run yet, rather than serving a
 * placeholder that would misrepresent an un-diffed exhibit as having one. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { videoDiffResult: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  if (!evidence.videoDiffResult) {
    return NextResponse.json({ error: "No video diff available — run it first." }, { status: 404 });
  }

  const buffer = await readFile(resolveEvidencePath(evidence.videoDiffResult.diffImagePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
