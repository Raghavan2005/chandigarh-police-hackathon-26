import type { SignalState, Verdict } from "@/lib/fusion";

/**
 * Document integrity verdict — the documents-evidence-kind equivalent of
 * fuseEvidence() (fusion.ts), but genuinely different in kind, not just
 * parameters: there is no ML classifier for documents in this build (see
 * WHAT_IS_REAL.md's own disclosed limitation), so there is no raw score to
 * cap. What DOES exist and IS real: a structural PKCS#7/CMS signature check
 * (pdf-signature.ts) and a creation-vs-modification-date consistency check
 * (metadata.ts). Before this module existed, both were computed and shown
 * in the "Technical provenance" panel, but never turned into a verdict —
 * the pipeline/verdict panels instead said "not available," which is
 * misleading once real signals actually exist. This closes that gap
 * honestly: it never claims a classifier-backed verdict, only what these
 * two structural checks can actually support.
 */
export interface DocumentFusionInput {
  signaturePresent: boolean;
  // null when signaturePresent is false (not meaningful) or when signature
  // detection itself failed (see pdf-signature.ts's own fallback).
  signatureCoversWholeFile: boolean | null;
  signerName: string | null;
  modifiedAfterCreation: boolean;
}

export interface DocumentFusionResult {
  verdict: Verdict; // AI_GENERATED never applies here — no image/video classifier involved.
  confidence: number;
  coverageCount: number; // 0-2
  confidenceCeiling: number;
  explanation: string;
  signalBreakdown: {
    signature: SignalState;
    tamperDate: SignalState;
  };
}

export function fuseDocumentEvidence(input: DocumentFusionInput): DocumentFusionResult {
  const signatureState: SignalState = !input.signaturePresent
    ? "absent"
    : input.signatureCoversWholeFile === false
      ? "contradicted"
      : "fired";
  // A valid, whole-file-covering signature already accounts for the file's
  // modification event (signing itself updates the mod date) — so the
  // tamper-date heuristic is only meaningful when there's no such signature
  // to explain the gap. Firing it anyway on a validly-signed file would
  // penalize the completely normal "edit then sign" workflow.
  const tamperDateState: SignalState =
    signatureState !== "fired" && input.modifiedAfterCreation ? "fired" : "absent";

  const coverageCount = [signatureState, tamperDateState].filter(
    (s) => s === "fired" || s === "contradicted",
  ).length;

  let verdict: Verdict;
  let confidence: number;
  let explanation: string;

  if (signatureState === "contradicted") {
    verdict = "MANIPULATED";
    confidence = 90;
    explanation = `Digitally signed${input.signerName ? ` by ${input.signerName}` : ""}, but the signature does not cover the whole file — concrete structural evidence that bytes were appended after signing. This is a real, checkable fact, not an inference.`;
  } else if (signatureState === "fired") {
    verdict = "AUTHENTIC";
    confidence = 85;
    explanation = `Digitally signed${input.signerName ? ` by ${input.signerName}` : ""}; the signature covers the whole file — no bytes have been added since signing. This confirms file integrity since the moment of signing. It does not verify the signer's certificate against a trusted certificate authority, and it says nothing about the truthfulness of the document's content.`;
  } else if (tamperDateState === "fired") {
    verdict = "INCONCLUSIVE";
    confidence = 55;
    explanation = "No digital signature found. The file's modification date is meaningfully later than its creation date — not proof of tampering on its own (ordinary editing produces the same pattern), but worth checking against the claimed chain of custody. No content-level document-forgery model exists in this build, so this structural signal alone cannot support a firmer verdict.";
  } else {
    verdict = "INCONCLUSIVE";
    confidence = 40;
    explanation = "No digital signature found and no inconsistency between creation and modification dates. This is a bare structural check — there is no content-level document-forgery model in this build, so the absence of these two red flags is not proof of authenticity.";
  }

  return {
    verdict,
    confidence,
    coverageCount,
    confidenceCeiling: confidence,
    explanation,
    signalBreakdown: { signature: signatureState, tamperDate: tamperDateState },
  };
}
