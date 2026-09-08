import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { resolveEvidencePath } from "@/lib/storage";
import { transcribeMedia, MlServiceError } from "@/lib/ml-client";

/**
 * Real Whisper transcription (ml-service, local — see transcriber.py) for
 * the live-captions feature. Cached like ImageDescriptionResult: a
 * real, compute-heavy call that shouldn't silently re-run on every case
 * reopen, always re-runnable on demand from the UI instead.
 *
 * No server-side sensitivity-gate check here, deliberately — matches every
 * other post-reveal analysis action in this codebase (describe-image,
 * extract-frame, reverse-image-search): reveal is enforced by the UI only
 * showing the trigger button once `revealed` is true, not by the server
 * re-deriving reveal state from the audit log.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { transcriptResult: { include: { translations: true } } },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const isAudio = evidence.mimeType.startsWith("audio/");
  const isVideo = evidence.mimeType.startsWith("video/");
  if (!isAudio && !isVideo) {
    return NextResponse.json(
      { error: "Captions are only available for audio and video evidence." },
      { status: 422 },
    );
  }

  if (evidence.transcriptResult) {
    return NextResponse.json(serializeTranscript(evidence.transcriptResult));
  }

  const buffer = await readFile(resolveEvidencePath(evidence.filePath));
  let result;
  try {
    result = await transcribeMedia(buffer, evidence.mimeType);
  } catch (error) {
    console.error("[transcript] ml-service /transcribe call failed:", error);
    if (error instanceof MlServiceError) {
      // The service is up and told us specifically why this file can't be
      // transcribed (e.g. no audio track) — surface that, don't blame
      // reachability. Its own 5xx (a genuine internal failure) still maps
      // to 502; anything else is a real, specific reason about this file.
      return NextResponse.json(
        { error: error.detail },
        { status: error.status >= 500 ? 502 : 422 },
      );
    }
    return NextResponse.json(
      { error: "Transcription failed — the ML service may be unreachable. Check it's running and try again." },
      { status: 502 },
    );
  }

  const saved = await db.transcriptResult.create({
    data: {
      evidenceId,
      language: result.language,
      segmentsJson: JSON.stringify(result.segments),
      truncated: result.truncated,
    },
    include: { translations: true },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-whisper-transcribe",
  });

  return NextResponse.json(serializeTranscript(saved));
}

type TranscriptWithTranslations = NonNullable<
  Awaited<ReturnType<typeof db.transcriptResult.findUnique>>
> & {
  translations: { targetLang: string; segmentsJson: string; ranAt: Date }[];
};

function serializeTranscript(row: TranscriptWithTranslations) {
  return {
    language: row.language,
    segments: JSON.parse(row.segmentsJson),
    truncated: row.truncated,
    ranAt: row.ranAt,
    hasSpeech: row.hasSpeech,
    speechRatio: row.speechRatio,
    speechValidatedAt: row.speechValidatedAt,
    translations: row.translations.map((t) => ({
      targetLang: t.targetLang,
      segments: JSON.parse(t.segmentsJson),
      ranAt: t.ranAt,
    })),
  };
}
