import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { resolveEvidencePath } from "@/lib/storage";
import { detectSplices } from "@/lib/ml-client";

/**
 * Real spectral-flux-based splice-point detection (ml-service, local — see
 * splice_detector.py) — cached like transcription/speech-validation. No
 * sensitivity gate: this is entirely local ml-service processing, nothing
 * leaves the platform, same trust boundary as /transcript and
 * /transcript/validate-speech.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { spliceDetectionResult: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const isAudio = evidence.mimeType.startsWith("audio/");
  const isVideo = evidence.mimeType.startsWith("video/");
  if (!isAudio && !isVideo) {
    return NextResponse.json(
      { error: "Splice detection is only available for audio and video evidence." },
      { status: 422 },
    );
  }

  if (evidence.spliceDetectionResult) {
    return NextResponse.json(serializeSpliceDetection(evidence.spliceDetectionResult));
  }

  const buffer = await readFile(resolveEvidencePath(evidence.filePath));
  const result = await detectSplices(buffer, evidence.mimeType).catch((error: unknown) => {
    console.error("[detect-splices] ml-service /detect-splices call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Splice detection failed — the ML service may be unreachable. Check it's running and try again." },
      { status: 502 },
    );
  }

  const saved = await db.spliceDetectionResult.create({
    data: {
      evidenceId,
      candidatesJson: JSON.stringify(result.candidates),
      totalSeconds: result.totalSeconds,
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-splice-detect",
  });

  return NextResponse.json(serializeSpliceDetection(saved));
}

function serializeSpliceDetection(row: { candidatesJson: string; totalSeconds: number; ranAt: Date }) {
  return {
    candidates: JSON.parse(row.candidatesJson) as { timestampSeconds: number; magnitude: number }[],
    totalSeconds: row.totalSeconds,
    ranAt: row.ranAt,
  };
}
