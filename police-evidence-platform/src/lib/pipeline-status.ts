export interface PipelineEvidenceInput {
  mimeType: string;
  uploadedAt: Date;
  metadataResult: {
    container: string | null;
    resolution: string | null;
    encoderSignature: string | null;
    // Only actually read for documents (application/pdf) — carries the
    // signature-check fields written by metadata.ts's extractPdfMetadata.
    exifJson: string | null;
  } | null;
  detectionResult: {
    manipulationProbability: number;
    generalAiProbability: number | null;
    sdxlProbability: number | null;
    modelName: string;
    modelVersion: string;
  } | null;
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
  // Documents have no ML classifier, no perceptual-hash equivalent, and no
  // C2PA check ever run against them (checkProvenance is only called from
  // the image/video/audio investigate path) — showing those steps as
  // "pending" would imply a capability that doesn't exist for this
  // evidence type. The two real, structural checks that DO exist for a PDF
  // (digital-signature check, creation-vs-modification-date consistency)
  // get their own step list instead of being forced into the classifier-
  // shaped one below.
  if (evidence.mimeType === "application/pdf") {
    let sig: { signaturePresent?: boolean; signatureCoversWholeFile?: boolean | null; signerName?: string | null } = {};
    try {
      sig = evidence.metadataResult?.exifJson ? JSON.parse(evidence.metadataResult.exifJson) : {};
    } catch {
      sig = {};
    }
    const steps: PipelineStep[] = [
      {
        id: "metadata",
        label: "Metadata extracted",
        done: Boolean(evidence.metadataResult),
        detail: "Page count, creation/modification dates, and producer/creator tool read from the PDF's own document info dictionary.",
        metrics: evidence.metadataResult
          ? [
              { label: "Container", value: evidence.metadataResult.container ?? "—" },
              ...(evidence.metadataResult.encoderSignature
                ? [{ label: "Editing tool signature", value: evidence.metadataResult.encoderSignature }]
                : []),
            ]
          : undefined,
      },
      {
        id: "signature",
        label: "Digital signature check",
        done: Boolean(evidence.metadataResult),
        detail: "Checks for an embedded PKCS#7/CMS signature and whether it covers the whole file — structural detection only, not a cryptographic trust-chain verification (see WHAT_IS_REAL.md).",
        metrics: evidence.metadataResult
          ? sig.signaturePresent
            ? [
                { label: "Signature present", value: "Yes" },
                { label: "Signer", value: sig.signerName ?? "—" },
                {
                  label: "Covers whole file",
                  value: sig.signatureCoversWholeFile ? "Yes" : "No — bytes appended after signing",
                },
              ]
            : [{ label: "Signature present", value: "No" }]
          : undefined,
      },
      {
        id: "fusion",
        label: "Document integrity verdict",
        done: Boolean(evidence.fusionVerdict),
        detail: "Signature status and tamper-date consistency combined into one verdict — no ML classifier exists for documents, so this is a structural check only, never a claim about the content's truthfulness.",
        metrics: evidence.fusionVerdict
          ? [
              { label: "Signals corroborating", value: `${evidence.fusionVerdict.coverageCount} / 2` },
              { label: "Verdict", value: evidence.fusionVerdict.verdict },
              { label: "Confidence", value: `${evidence.fusionVerdict.confidence}%` },
            ]
          : undefined,
      },
    ];
    return {
      steps,
      totalMs: evidence.fusionVerdict
        ? evidence.fusionVerdict.computedAt.getTime() - evidence.uploadedAt.getTime()
        : null,
    };
  }

  // Plain-text evidence (a WhatsApp "Export chat" .txt, or generic text) —
  // like PDF, no ML classifier and no C2PA/perceptual-hash equivalent
  // exists for this evidence type. Unlike PDF, there is also no
  // signature/tamper-date structural check possible at all: a .txt file
  // has no embedded creation date or signature format to check, so this
  // gets an honest one-step pipeline (real extraction) rather than forcing
  // in a check that doesn't apply, or silently reusing PDF's document-
  // integrity verdict shape for a file type it was never computed for
  // (evidence-ingest.ts only ever runs fuseDocumentEvidence for
  // container === "PDF").
  if (evidence.mimeType === "text/plain") {
    let chatInfo: { isWhatsAppChat?: boolean; participants?: string[]; messageCount?: number; mediaOmittedCount?: number; dateRangeStart?: string | null; dateRangeEnd?: string | null } = {};
    try {
      chatInfo = evidence.metadataResult?.exifJson ? JSON.parse(evidence.metadataResult.exifJson) : {};
    } catch {
      chatInfo = {};
    }
    const steps: PipelineStep[] = [
      {
        id: "metadata",
        label: chatInfo.isWhatsAppChat ? "Chat export parsed" : "Text extracted",
        done: Boolean(evidence.metadataResult),
        detail: chatInfo.isWhatsAppChat
          ? "Recognized as a real WhatsApp \"Export chat\" .txt file — parsed into individual messages with sender, timestamp, and media-omitted markers preserved. No signature or tamper-date check applies to this evidence type (a .txt file has neither to check) — content analysis (below) is what's available instead."
          : "Read as plain text — not a recognized WhatsApp chat export format, so treated as generic text content rather than fabricating a chat structure it doesn't have.",
        metrics: evidence.metadataResult
          ? chatInfo.isWhatsAppChat
            ? [
                { label: "Participants", value: (chatInfo.participants ?? []).join(", ") || "—" },
                { label: "Messages", value: String(chatInfo.messageCount ?? 0) },
                { label: "Media omitted", value: String(chatInfo.mediaOmittedCount ?? 0) },
                {
                  label: "Date range",
                  value:
                    chatInfo.dateRangeStart && chatInfo.dateRangeEnd
                      ? `${new Date(chatInfo.dateRangeStart).toLocaleDateString("en-IN")} – ${new Date(chatInfo.dateRangeEnd).toLocaleDateString("en-IN")}`
                      : "—",
                },
              ]
            : [{ label: "Container", value: evidence.metadataResult.container ?? "—" }]
          : undefined,
      },
    ];
    return { steps, totalMs: null };
  }

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
            { label: "Face-swap classifier score", value: `${Math.round(evidence.detectionResult.manipulationProbability)}%` },
            // Null for audio, which has no image-classifier equivalent at
            // all — omit the row rather than show a fabricated 0%.
            ...(evidence.detectionResult.generalAiProbability !== null
              ? [{ label: "General AI-image classifier score", value: `${Math.round(evidence.detectionResult.generalAiProbability)}%` }]
              : []),
            // Third, modern-diffusion-focused signal (sdxl_detector.py) —
            // same null-for-audio guard as the general AI-image row above.
            ...(evidence.detectionResult.sdxlProbability !== null
              ? [{ label: "SDXL/modern-diffusion classifier score", value: `${Math.round(evidence.detectionResult.sdxlProbability)}%` }]
              : []),
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
