import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Streams one real detected face crop, selected by `?index=N` (default 0
 * — MTCNN's actual aligned classifier input; any other index is a plain
 * display-only crop of that detected face). Written by /investigate. 404s
 * plainly if detection hasn't run yet, no face was detected, or the index
 * is out of range, rather than serving a placeholder that would
 * misrepresent any of those states. */
export async function GET(
  request: Request,
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

  const indexParam = new URL(request.url).searchParams.get("index");
  const index = indexParam ? Number.parseInt(indexParam, 10) : 0;

  let paths: string[] = [];
  try {
    paths = evidence.detectionResult ? JSON.parse(evidence.detectionResult.faceCropPathsJson) : [];
  } catch {
    paths = [];
  }
  const cropPath = Number.isInteger(index) ? paths[index] : undefined;
  if (!cropPath) {
    return NextResponse.json(
      { error: "No face crop available at that index — either detection hasn't run yet, no face was detected, or the index is out of range." },
      { status: 404 },
    );
  }

  const buffer = await readFile(resolveEvidencePath(cropPath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
