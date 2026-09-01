import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, writeHeatmap } from "@/lib/storage";
import { detectImage, detectVideoFrame } from "@/lib/ml-client";
import { sampleVideoFrames } from "@/lib/frame-extract";
import { computePerceptualHash } from "@/lib/perceptual-hash";
import { findMatches } from "@/lib/matching";
import { fuseEvidence } from "@/lib/fusion";
import { checkProvenance } from "@/lib/provenance";

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
  if (!isImage && !isVideo) {
    // Honest scope boundary, not a bug — per the plan, audio/document
    // detection is explicitly deprioritized below image/video for the MVP
    // timeline. Say so plainly rather than forcing a fake score through.
    return NextResponse.json(
      { error: "Detection is not available for this evidence type yet (image/video only in this build)." },
      { status: 422 },
    );
  }

  const absolutePath = resolveEvidencePath(evidence.filePath);
  const fileBuffer = await readFile(absolutePath);

  // --- Stage 2: detection (external HTTP call — must happen before the DB
  // transaction below, not inside it; a network call has no place holding a
  // SQLite transaction open). ---
  let classifierScore: number;
  let heatmapPngBase64: string;
  let hashSourceBuffer: Buffer; // what gets perceptual-hashed — the image itself, or the representative video frame

  if (isImage) {
    const result = await detectImage(fileBuffer, evidence.mimeType);
    classifierScore = result.probability;
    heatmapPngBase64 = result.heatmapPngBase64;
    hashSourceBuffer = fileBuffer;
  } else {
    const durationSeconds = evidence.metadataResult?.duration ? parseFloat(evidence.metadataResult.duration) : 0;
    const frames = await sampleVideoFrames(absolutePath, durationSeconds);
    if (frames.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any frames from this video — check the file isn't corrupt." },
        { status: 422 },
      );
    }
    const frameResults = await Promise.all(frames.map((frame) => detectVideoFrame(frame)));
    // Worst-frame signal, per PS4_ANALYSIS_PIPELINE.md §6 — "flags which
    // frames," not an average that dilutes a brief manipulated segment
    // across an otherwise-clean clip.
    const worst = frameResults.reduce((max, r) => (r.probability > max.probability ? r : max));
    classifierScore = worst.probability;
    heatmapPngBase64 = worst.heatmapPngBase64;
    hashSourceBuffer = frames[frameResults.indexOf(worst)];
  }

  // --- Stage 3: provenance (C2PA), Stage 4a: perceptual hash — both local,
  // fast, run in parallel with each other (independent per the pipeline).
  // Provenance is checked against the original file buffer, not a video
  // frame — a C2PA manifest lives in the source container, not a derived
  // still image extracted from it. ---
  const [provenance, phash] = await Promise.all([
    checkProvenance(fileBuffer, evidence.mimeType),
    computePerceptualHash(hashSourceBuffer, "image/jpeg"),
  ]);

  const heatmapPath = writeHeatmap(evidence.id, heatmapPngBase64);

  const { fusionVerdict, matchCounts, auditEntry } = await db.$transaction(async (tx) => {
    await tx.detectionResult.upsert({
      where: { evidenceId: evidence.id },
      create: {
        evidenceId: evidence.id,
        manipulationProbability: classifierScore,
        heatmapPath,
        modelName: "not-lain/deepfake",
        modelVersion: "InceptionResnetV1-vggface2",
      },
      update: { manipulationProbability: classifierScore, heatmapPath },
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
