export interface PipelineEvidenceInput {
  mimeType: string;
  uploadedAt: Date;
  metadataResult: { container: string | null; resolution: string | null; encoderSignature: string | null } | null;
  detectionResult: { manipulationProbability: number; modelName: string; modelVersion: string } | null;
  provenanceResult: { c2paPresent: boolean; c2paValid: boolean } | null;
  fusionVerdict: { coverageCount: number; verdict: string; confidence: number; computedAt: Date } | null;
  matchesFrom: unknown[];
  corpusMatches: unknown[];
}

export interface PipelineStep {
  id: string;
  label: string;
  done: boolean;
  detail: string;
  metrics?: { label: string; value: string }[];
}

export interface PipelineStatus {
  steps: PipelineStep[];
  totalMs: number | null;
}

/**
 * Shared with GET /api/cases/:caseId/evidence/:evidenceId/pipeline-status
 * (PS4_MVP_BUILD_PLAN.md §5 names this endpoint at the case level, but
 * pipeline state is inherently per-evidence — a case can hold several
 * Evidence rows each with independent metadata/detection/provenance/fusion
 * results, so this is scoped per-evidence instead) so the API route and
 * RealPipelinePanel compute the exact same "is this step done" logic from
 * one place, not two copies that could drift.
 */
export function computePipelineStatus(evidence: PipelineEvidenceInput): PipelineStatus {
  const matchCount = evidence.matchesFrom.length + evidence.corpusMatches.length;
  // Audio has no perceptual-hash equivalent (Evidence.phash is "null for
  // audio/document" per its schema comment) — the matching step still runs
  // (it's part of the same transaction as fusion) but never has anything
  // to hash, so its match count is always 0 by definition, not because
  // nothing happened to match against. Saying "perceptual hash checked"
  // for audio would claim a step that never actually ran.
  const isAudio = evidence.mimeType.startsWith("audio/");

  const steps: PipelineStep[] = [
    {
      id: "metadata",
      label: "Metadata extracted",
      done: Boolean(evidence.metadataResult),
      detail: "Container, resolution, codec, and encoder signature read from the uploaded file.",
      metrics: evidence.metadataResult
        ? [
            { label: "Container", value: evidence.metadataResult.container ?? "—" },
            { label: "Resolution", value: evidence.metadataResult.resolution ?? "—" },
            ...(evidence.metadataResult.encoderSignature
              ? [{ label: "Encoder signature", value: evidence.metadataResult.encoderSignature }]
              : []),
          ]
        : undefined,
    },
    {
      id: "detection",
      label: "Manipulation detection",
      done: Boolean(evidence.detectionResult),
      detail: "ML classifier scores the file for manipulation/synthesis artifacts.",
      metrics: evidence.detectionResult
        ? [
            { label: "Raw classifier score", value: `${Math.round(evidence.detectionResult.manipulationProbability)}%` },
            { label: "Model", value: `${evidence.detectionResult.modelName} ${evidence.detectionResult.modelVersion}` },
          ]
        : undefined,
    },
    {
      id: "provenance",
      label: "Provenance / C2PA check",
      done: Boolean(evidence.provenanceResult),
      detail: "Checked for a valid Content Credential (C2PA) manifest and signing chain.",
      metrics: evidence.provenanceResult
        ? [
            { label: "C2PA manifest found", value: evidence.provenanceResult.c2paPresent ? "Yes" : "No" },
            ...(evidence.provenanceResult.c2paPresent
              ? [{ label: "Manifest valid", value: evidence.provenanceResult.c2paValid ? "Yes" : "No" }]
              : []),
          ]
        : undefined,
    },
    {
      id: "matching",
      // Runs transactionally alongside fusion in the same /investigate
      // call, so "done" tracks fusionVerdict rather than a result row of
      // its own — there's no separate MatchingResult table.
      label: "Hash / cross-case matching",
      done: Boolean(evidence.fusionVerdict),
      detail: isAudio
        ? "Not applicable to audio — no perceptual-hash equivalent exists for this evidence type yet."
        : "Perceptual hash checked against the seeded corpus and every other case's evidence.",
      metrics: evidence.fusionVerdict && !isAudio ? [{ label: "Matches found", value: String(matchCount) }] : undefined,
    },
    {
      id: "fusion",
      label: "Evidence fusion",
      done: Boolean(evidence.fusionVerdict),
      detail: "Classifier score capped by how many signals actually corroborate it — not a weighted average.",
      metrics: evidence.fusionVerdict
        ? [
            { label: "Signals corroborating", value: `${evidence.fusionVerdict.coverageCount} / 3` },
            { label: "Verdict", value: evidence.fusionVerdict.verdict },
            { label: "Confidence", value: `${evidence.fusionVerdict.confidence}%` },
          ]
        : undefined,
    },
  ];

  const totalMs = evidence.fusionVerdict
    ? evidence.fusionVerdict.computedAt.getTime() - evidence.uploadedAt.getTime()
    : null;

  return { steps, totalMs };
}
