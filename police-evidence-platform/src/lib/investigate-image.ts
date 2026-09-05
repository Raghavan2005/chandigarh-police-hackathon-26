import { readFile } from "fs/promises";
import { db } from "@/lib/db";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, writeFaceCrops, writeHeatmap } from "@/lib/storage";
import { detectImage } from "@/lib/ml-client";
import { computePerceptualHash } from "@/lib/perceptual-hash";
import { findMatches } from "@/lib/matching";
import { fuseEvidence } from "@/lib/fusion";
import { checkProvenance } from "@/lib/provenance";
import { raiseVerdictAlerts } from "@/lib/alerts";

interface RunImageInvestigationInput {
  evidenceId: string;
  caseId: string;
  actorId: string;
  auditDevice?: string;
}

type RunImageInvestigationResult =
  | {
      ok: true;
      verdict: string;
      confidence: number;
      explanation: string;
      coverageCount: number;
      corpusMatches: number;
      crossCaseMatches: number;
    }
  | { ok: false; status: number; error: string };

/**
 * The image half of the single "Investigate" action (PS4_ANALYSIS_PIPELINE.md
 * §2/§4) — extracted out of investigate/route.ts so the tablet capture route
 * (api/capture/[token]) can trigger the exact same detection/provenance/
 * hash-match/fusion pipeline automatically right after an upload, instead of
 * a second, independently-maintained copy. Video/audio stay inline in the
 * route — this is image-only, self-contained (fetches its own evidence row).
 */
export async function runImageInvestigation(
  input: RunImageInvestigationInput,
): Promise<RunImageInvestigationResult> {
  const evidence = await db.evidence.findUnique({
    where: { id: input.evidenceId },
    include: { metadataResult: true, case: { select: { investigatorId: true } } },
  });
  if (!evidence || evidence.caseId !== input.caseId) {
    return { ok: false, status: 404, error: "Evidence not found on this case." };
  }
  if (!evidence.mimeType.startsWith("image/")) {
    return { ok: false, status: 422, error: "This evidence is not an image." };
  }

  const absolutePath = resolveEvidencePath(evidence.filePath);
  const fileBuffer = await readFile(absolutePath);

  // --- Stage 2: detection (external HTTP call — must happen before the DB
  // transaction below, not inside it). ---
  const detection = await detectImage(fileBuffer, evidence.mimeType);
  const heatmapPngBase64 = detection.heatmapPngBase64;
  const faceBoxes = detection.faceBoxes;
  const faceCropsPngBase64 = detection.faceCropsPngBase64;

  // --- Stage 3: provenance (C2PA), Stage 4a: perceptual hash — both local,
  // fast, run in parallel with each other (independent per the pipeline). ---
  const [provenance, phash] = await Promise.all([
    checkProvenance(fileBuffer, evidence.mimeType),
    computePerceptualHash(fileBuffer, "image/jpeg"),
  ]);

  const heatmapPath = heatmapPngBase64 ? writeHeatmap(evidence.id, heatmapPngBase64) : null;
  const faceCropPaths = writeFaceCrops(evidence.id, faceCropsPngBase64);
  const faceBoxesJson = JSON.stringify(faceBoxes);
  const faceCropPathsJson = JSON.stringify(faceCropPaths);

  const modelName = "not-lain/deepfake";
  const modelVersion = "InceptionResnetV1-vggface2";

  const { fusionVerdict, matchCounts, auditEntry } = await db.$transaction(async (tx) => {
    await tx.detectionResult.upsert({
      where: { evidenceId: evidence.id },
      create: {
        evidenceId: evidence.id,
        manipulationProbability: detection.probability,
        generalAiProbability: detection.generalAiProbability,
        heatmapPath,
        faceBoxesJson,
        faceCropPathsJson,
        frameScoresJson: null,
        modelName,
        modelVersion,
      },
      update: {
        manipulationProbability: detection.probability,
        generalAiProbability: detection.generalAiProbability,
        heatmapPath,
        faceBoxesJson,
        faceCropPathsJson,
        frameScoresJson: null,
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
      matchCounts = await findMatches(evidence.id, phash, input.caseId, tx);
    }

    const metadataInconsistent = Boolean(evidence.metadataResult?.encoderSignature);
    // Fusion sees both raw scores and picks whichever is more alarming
    // internally — this is what closes the general-AI-detector's coverage
    // gap (see general_ai_detector.py's docstring): the face-swap model
    // alone scored a known-real full-synthesis test image 0%, so relying
    // on it alone would keep missing that whole content class even with
    // this second model now running. Both scores are also stored
    // separately in DetectionResult above, never blended in the DB.
    const fusion = fuseEvidence({
      faceSwapScore: detection.probability,
      generalAiScore: detection.generalAiProbability,
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
      {
        caseId: input.caseId,
        evidenceHash: evidence.sha256,
        actorId: input.actorId,
        action: "ANALYZED",
        device: input.auditDevice ?? "pramana-investigate",
      },
      tx,
    );

    await raiseVerdictAlerts(
      {
        caseId: input.caseId,
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

  return {
    ok: true,
    verdict: fusionVerdict.verdict,
    confidence: fusionVerdict.confidence,
    explanation: fusionVerdict.explanation,
    coverageCount: fusionVerdict.coverageCount,
    corpusMatches: matchCounts.corpusMatchCount,
    crossCaseMatches: matchCounts.evidenceMatchCount,
  };
}
