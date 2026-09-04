import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, writeFaceCrops, writeFrameHeatmaps, writeHeatmap } from "@/lib/storage";
import { detectAudio, detectVideoFrame } from "@/lib/ml-client";
import { sampleVideoFrames } from "@/lib/frame-extract";
import { computePerceptualHash } from "@/lib/perceptual-hash";
import { findMatches } from "@/lib/matching";
import { fuseEvidence } from "@/lib/fusion";
import { checkProvenance } from "@/lib/provenance";
import { runImageInvestigation } from "@/lib/investigate-image";
import { raiseVerdictAlerts } from "@/lib/alerts";

/**
 * The single "Investigate" action (PS4_ANALYSIS_PIPELINE.md §2/§4,
 * PS4_ROUND1_STRATEGY_CHAT.md's "single INVESTIGATE action" design) — runs
 * detection, provenance, and hash/corpus matching (Stages 2-4, independent
 * of each other) then Evidence Fusion (Stage 6), and writes one ANALYZED
 * audit entry for the whole run. Stage 1 (metadata) already ran at upload
 * time — see the evidence route — so it isn't repeated here.
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
    include: { metadataResult: true, case: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const isImage = evidence.mimeType.startsWith("image/");
  const isVideo = evidence.mimeType.startsWith("video/");
  const isAudio = evidence.mimeType.startsWith("audio/");
  if (!isImage && !isVideo && !isAudio) {
    // Honest scope boundary, not a bug — document detection is metadata/
    // text extraction only (src/lib/metadata.ts), not run through a
    // classifier here, since there's no real document-tamper ML model
    // behind it. Say so plainly rather than forcing a fake score through.
    return NextResponse.json(
      { error: "Detection is not available for this evidence type yet (image/video/audio only in this build)." },
      { status: 422 },
    );
  }

  if (isImage) {
    const result = await runImageInvestigation({ evidenceId, caseId, actorId: session.userId });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      verdict: result.verdict,
      confidence: result.confidence,
      explanation: result.explanation,
      coverageCount: result.coverageCount,
      corpusMatches: result.corpusMatches,
      crossCaseMatches: result.crossCaseMatches,
    });
  }

  const absolutePath = resolveEvidencePath(evidence.filePath);
  const fileBuffer = await readFile(absolutePath);

  // --- Stage 2: detection (external HTTP call — must happen before the DB
  // transaction below, not inside it; a network call has no place holding a
  // SQLite transaction open). ---
  let classifierScore: number;
  let heatmapPngBase64: string | null = null;
  let faceBoxes: [number, number, number, number][] = [];
  let faceCropsPngBase64: string[] = [];
  // What gets perceptual-hashed — the representative video frame. Audio has
  // no perceptual-hash equivalent (schema comment on Evidence.phash: "null
  // for audio/document") — stays null.
  let hashSourceBuffer: Buffer | null = null;
  // Real per-sampled-frame breakdown, video only — previously computed by
  // scoring every sampled frame to find the worst one, then discarded.
  // Now kept and stored so the investigator UI can show a real frame-by-
  // frame timeline instead of one static worst frame with no time context.
  let frameScores: { timestampSeconds: number; probability: number; faceDetected: boolean }[] | null = null;
  // Every sampled frame already gets a full Grad-CAM heatmap computed by
  // the ML service (not just the worst-scoring one) — previously all but
  // the worst frame's heatmap were discarded after scoring. Now kept so
  // the modified region can be browsed across the whole clip.
  let frameHeatmapsPngBase64: string[] | null = null;

  if (isVideo) {
    const durationSeconds = evidence.metadataResult?.duration ? parseFloat(evidence.metadataResult.duration) : 0;
    const frames = await sampleVideoFrames(absolutePath, durationSeconds);
    if (frames.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any frames from this video — check the file isn't corrupt." },
        { status: 422 },
      );
    }
    const frameResults = await Promise.all(frames.map((frame) => detectVideoFrame(frame.buffer)));
    // Worst-frame signal, per PS4_ANALYSIS_PIPELINE.md §6 — "flags which
    // frames," not an average that dilutes a brief manipulated segment
    // across an otherwise-clean clip.
    const worstIndex = frameResults.reduce(
      (maxIdx, r, i) => (r.probability > frameResults[maxIdx].probability ? i : maxIdx),
      0,
    );
    const worst = frameResults[worstIndex];
    classifierScore = worst.probability;
    heatmapPngBase64 = worst.heatmapPngBase64;
    // Face boxes/crops are relative to that same worst-scoring frame — the
    // one still image actually shown for the heatmap, not the whole video.
    faceBoxes = worst.faceBoxes;
    faceCropsPngBase64 = worst.faceCropsPngBase64;
    hashSourceBuffer = frames[worstIndex].buffer;
    frameScores = frameResults.map((r, i) => ({
      timestampSeconds: frames[i].timestampSeconds,
      probability: r.probability,
      faceDetected: r.faceDetected,
    }));
    frameHeatmapsPngBase64 = frameResults.map((r) => r.heatmapPngBase64);
  } else {
    // Audio: a 1D waveform classifier has no spatial heatmap/perceptual-hash
    // equivalent — those stay null/absent rather than fabricating a
    // meaningless visualization or hash.
    const result = await detectAudio(fileBuffer, evidence.mimeType);
    classifierScore = result.probability;
  }

  // --- Stage 3: provenance (C2PA), Stage 4a: perceptual hash — both local,
  // fast, run in parallel with each other (independent per the pipeline).
  // Provenance is checked against the original file buffer, not a video
  // frame — a C2PA manifest lives in the source container, not a derived
  // still image extracted from it. ---
  const [provenance, phash] = await Promise.all([
    checkProvenance(fileBuffer, evidence.mimeType),
    hashSourceBuffer ? computePerceptualHash(hashSourceBuffer, "image/jpeg") : Promise.resolve(null),
  ]);

  const heatmapPath = heatmapPngBase64 ? writeHeatmap(evidence.id, heatmapPngBase64) : null;
  const faceCropPaths = writeFaceCrops(evidence.id, faceCropsPngBase64);
  const faceBoxesJson = JSON.stringify(faceBoxes);
  const faceCropPathsJson = JSON.stringify(faceCropPaths);
  const frameScoresJson = frameScores ? JSON.stringify(frameScores) : null;
  const frameHeatmapPaths = frameHeatmapsPngBase64 ? writeFrameHeatmaps(evidence.id, frameHeatmapsPngBase64) : null;
  const frameHeatmapPathsJson = frameHeatmapPaths ? JSON.stringify(frameHeatmapPaths) : null;

  const modelName = isAudio ? "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification" : "not-lain/deepfake";
  const modelVersion = isAudio ? "wav2vec2-large-xlsr-53" : "InceptionResnetV1-vggface2";

  const { fusionVerdict, matchCounts, auditEntry } = await db.$transaction(async (tx) => {
    await tx.detectionResult.upsert({
      where: { evidenceId: evidence.id },
      create: {
        evidenceId: evidence.id,
        manipulationProbability: classifierScore,
        heatmapPath,
        faceBoxesJson,
        faceCropPathsJson,
        frameScoresJson,
        frameHeatmapPathsJson,
        modelName,
        modelVersion,
      },
      update: {
        manipulationProbability: classifierScore,
        heatmapPath,
        faceBoxesJson,
        faceCropPathsJson,
        frameScoresJson,
        frameHeatmapPathsJson,
        modelName,
        modelVersion,
      },
    });

    await tx.provenanceResult.upsert({
      where: { evidenceId: evidence.id },
      create: { evidenceId: evidence.id, ...provenance },
      update: provenance,
    });

    let matchCounts = { corpusMatchCount: 0, evidenceMatchCount: 0 };
    if (phash) {
      await tx.evidence.update({ where: { id: evidence.id }, data: { phash } });
      matchCounts = await findMatches(evidence.id, phash, caseId, tx);
    }

    const metadataInconsistent = Boolean(evidence.metadataResult?.encoderSignature);
    const fusion = fuseEvidence({
      classifierScore,
      metadataInconsistent,
      c2paPresent: provenance.c2paPresent,
      c2paValid: provenance.c2paValid,
      hashMatchFound: matchCounts.corpusMatchCount > 0 || matchCounts.evidenceMatchCount > 0,
    });

    const fusionVerdict = await tx.fusionVerdict.upsert({
      where: { evidenceId: evidence.id },
      create: {
        evidenceId: evidence.id,
        verdict: fusion.verdict,
        confidence: fusion.confidence,
        coverageCount: fusion.coverageCount,
        confidenceCeiling: fusion.confidenceCeiling,
        explanation: fusion.explanation,
        // Every corroborating check recorded explicitly, absence included —
        // PS4_MVP_BUILD_PLAN.md §4's "log absence as a fact, not silence."
        signalBreakdownJson: JSON.stringify(fusion.signalBreakdown),
      },
      update: {
        verdict: fusion.verdict,
        confidence: fusion.confidence,
        coverageCount: fusion.coverageCount,
        confidenceCeiling: fusion.confidenceCeiling,
        explanation: fusion.explanation,
        signalBreakdownJson: JSON.stringify(fusion.signalBreakdown),
      },
    });

    const auditEntry = await writeAuditEntryInTx(
      { caseId, evidenceHash: evidence.sha256, actorId: session.userId, action: "ANALYZED", device: "pramana-investigate" },
      tx,
    );

    await raiseVerdictAlerts(
      {
        caseId,
        evidenceId: evidence.id,
        investigatorId: evidence.case.investigatorId,
        verdict: fusionVerdict.verdict,
        confidence: fusionVerdict.confidence,
        crossCaseMatchCount: matchCounts.evidenceMatchCount,
      },
      tx,
    );

    return { fusionVerdict, matchCounts, auditEntry };
  });

  appendCheckpoint(auditEntry);

  return NextResponse.json({
    verdict: fusionVerdict.verdict,
    confidence: fusionVerdict.confidence,
    explanation: fusionVerdict.explanation,
    coverageCount: fusionVerdict.coverageCount,
    corpusMatches: matchCounts.corpusMatchCount,
    crossCaseMatches: matchCounts.evidenceMatchCount,
  });
}
