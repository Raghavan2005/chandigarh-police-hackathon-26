import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { resolveEvidencePath } from "@/lib/storage";
import { validateSpeech } from "@/lib/ml-client";

/**
 * Real Silero VAD check (speech_validator.py), independent of whatever
 * Whisper transcribed — guards against Whisper's known failure mode of
 * hallucinating plausible-looking text over silence/music/noise, so a
 * non-empty transcript alone is never presented as proof the clip contains
 * real speech. On-demand only, requires a transcript to already exist
 * (there's nothing to validate otherwise).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId }, include: { transcriptResult: true } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  if (!evidence.transcriptResult) {
    return NextResponse.json({ error: "Generate captions before validating speech." }, { status: 422 });
  }

  const buffer = await readFile(resolveEvidencePath(evidence.filePath));
  const result = await validateSpeech(buffer, evidence.mimeType).catch((error: unknown) => {
    console.error("[transcript/validate-speech] ml-service /validate-speech call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Speech validation failed — the ML service may be unreachable. Check it's running and try again." },
      { status: 502 },
    );
  }

  const saved = await db.transcriptResult.update({
    where: { evidenceId },
    data: {
      hasSpeech: result.hasSpeech,
      speechRatio: result.speechRatio,
      speechValidatedAt: new Date(),
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-vad-validate-speech",
  });

  return NextResponse.json({
    hasSpeech: saved.hasSpeech,
    speechRatio: saved.speechRatio,
    speechValidatedAt: saved.speechValidatedAt,
  });
}
