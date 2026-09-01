import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Streams the real aligned face crop MTCNN produced — the literal image
 * the deepfake classifier scored, written by /investigate. 404s plainly if
 * detection hasn't run yet or no face was detected, rather than serving a
 * placeholder that would misrepresent either state. */
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
  if (!evidence.detectionResult?.faceCropPath) {
    return NextResponse.json(
      { error: "No face crop available — either detection hasn't run yet or no face was detected." },
      { status: 404 },
    );
  }

  const buffer = await readFile(resolveEvidencePath(evidence.detectionResult.faceCropPath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
  });
}
