import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { translateSegments, type TranscriptSegment } from "@/lib/ml-client";

/**
 * On-demand caption translation — only ever runs when an investigator asks
 * for a specific language, never automatically alongside transcription
 * (§8 "avoid unnecessary [model] calls"). Requires a TranscriptResult to
 * already exist; this endpoint never transcribes itself.
 */
const translateSchema = z.object({
  targetLang: z.string().min(2).max(8),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;

  const parsed = translateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid translate request.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { targetLang } = parsed.data;

  const evidence = await db.evidence.findUnique({ where: { id: evidenceId }, include: { transcriptResult: true } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  const transcript = evidence.transcriptResult;
  if (!transcript) {
    return NextResponse.json(
      { error: "Generate captions before requesting a translation." },
      { status: 422 },
    );
  }

  const existing = await db.transcriptTranslation.findUnique({
    where: { transcriptResultId_targetLang: { transcriptResultId: transcript.id, targetLang } },
  });
  if (existing) {
    return NextResponse.json({ targetLang, segments: JSON.parse(existing.segmentsJson), ranAt: existing.ranAt });
  }

  const segments: TranscriptSegment[] = JSON.parse(transcript.segmentsJson);
  if (segments.length === 0) {
    return NextResponse.json(
      { error: "This transcript has no speech segments to translate." },
      { status: 422 },
    );
  }

  const result = await translateSegments(segments, transcript.language, targetLang).catch((error: unknown) => {
    console.error("[transcript/translate] ml-service /translate call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      {
        error:
          "Translation failed — either the ML service is unreachable, or this language pair isn't supported. Check it's running and try again.",
      },
      { status: 502 },
    );
  }

  const saved = await db.transcriptTranslation.create({
    data: {
      transcriptResultId: transcript.id,
      targetLang,
      segmentsJson: JSON.stringify(result.segments),
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-nllb-translate",
  });

  return NextResponse.json({ targetLang, segments: result.segments, ranAt: saved.ranAt });
}
