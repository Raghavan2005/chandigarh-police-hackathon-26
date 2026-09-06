import { StatusDot } from "@/components/shared/status-dot";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import type { Verdict } from "@/lib/types";

type SignalState = "fired" | "absent" | "contradicted";

export interface FusionSignalConfig {
  key: string;
  label: string;
  describe: (state: SignalState) => string;
  // Per-signal, not global — "fired" means something bad for a metadata
  // inconsistency, but something GOOD for a document's whole-file signature
  // coverage, so the color mapping can't be inferred from the state name
  // alone. Defaults to the image/video/audio convention (fired=critical)
  // when omitted.
  statusFor?: (state: SignalState) => "critical" | "warning" | "safe" | "neutral";
}

function defaultStatusFor(state: SignalState): "critical" | "warning" | "safe" | "neutral" {
  if (state === "fired") return "critical";
  if (state === "contradicted") return "warning";
  return "neutral";
}

const IMAGE_VIDEO_AUDIO_SIGNALS: FusionSignalConfig[] = [
  {
    key: "metadata",
    label: "Metadata consistency",
    describe: (state) =>
      state === "fired"
        ? "Editing-software signature found on the file (e.g. professional encoder on claimed-raw footage)."
        : "No inconsistency in the file's metadata.",
  },
  {
    key: "c2pa",
    label: "C2PA / Provenance",
    describe: (state) =>
      state === "contradicted"
        ? "A Content Credential is present but failed validation."
        : "No Content Credential present — neutral, not suspicious (most real evidence has none).",
  },
  {
    key: "hashMatch",
    label: "Hash / corpus match",
    describe: (state) =>
      state === "fired" ? "This file matches another item in the seeded corpus or another case." : "No matching file found yet.",
  },
];

// The documents-evidence-kind equivalent — there is no ML classifier for
// documents (see document-fusion.ts's own docstring), so these two are
// structural checks only: a real PKCS#7/CMS signature check and a
// creation-vs-modification-date consistency check.
export const DOCUMENT_FUSION_SIGNALS: FusionSignalConfig[] = [
  {
    key: "signature",
    label: "Digital signature",
    describe: (state) =>
      state === "contradicted"
        ? "Digitally signed, but the signature does not cover the whole file — bytes were added after signing."
        : state === "fired"
          ? "Digitally signed, and the signature covers the whole file — no bytes added since signing."
          : "No digital signature found on this file.",
    // Inverted from the default convention: "fired" here means a valid,
    // whole-file signature was found — a good sign, not a bad one.
    statusFor: (state) => (state === "fired" ? "safe" : state === "contradicted" ? "critical" : "neutral"),
  },
  {
    key: "tamperDate",
    label: "Modification-date consistency",
    describe: (state) =>
      state === "fired"
        ? "The file's modification date is meaningfully later than its creation date — not proof of tampering on its own, but worth checking against the claimed chain of custody."
        : "No inconsistency between creation and modification dates (or not meaningful — a valid whole-file signature already accounts for the file's last modification).",
    statusFor: (state) => (state === "fired" ? "warning" : "neutral"),
  },
];

/**
 * Honest real-case equivalent of FusionPanel — deliberately NOT the same
 * weighted-signal-bars visual, because that would misrepresent how the
 * real Evidence Fusion algorithm works. Ours is coverage-based capping
 * (PS4_MVP_BUILD_PLAN.md §4): a raw classifier score gets capped by how
 * many of these three signals actually corroborate it, and the verdict
 * follows from that capped number, not a weighted sum. This shows exactly
 * that mechanism, including logging absence as a fact rather than omitting
 * a signal that didn't fire (the jury panel's specific ask).
 */
export function RealFusionSignals({
  signalBreakdownJson,
  coverageCount,
  confidenceCeiling,
  verdict,
  confidence,
  explanation,
  signals = IMAGE_VIDEO_AUDIO_SIGNALS,
  totalSignals = 3,
  introText,
}: {
  signalBreakdownJson: string;
  coverageCount: number;
  confidenceCeiling: number;
  verdict: string;
  confidence: number;
  explanation: string;
  // Which signal set to render — defaults to the original image/video/audio
  // three. Documents pass DOCUMENT_FUSION_SIGNALS (2 signals) instead.
  signals?: FusionSignalConfig[];
  totalSignals?: number;
  // The default sentence assumes a raw classifier score being capped —
  // doesn't apply to documents (no classifier at all, the verdict comes
  // purely from these structural checks) — callers with no score to cap
  // pass their own complete sentence instead of a plugged-in noun phrase.
  introText?: string;
}) {
  let breakdown: Record<string, SignalState> = {};
  try {
    breakdown = JSON.parse(signalBreakdownJson);
  } catch {
    breakdown = {};
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-secondary">
        {introText ?? (
          <>
            The classifier score is capped by how many of the {totalSignals} signals below actually corroborate it —
            not averaged with fixed weights. With {coverageCount} of {totalSignals} signals corroborating, confidence
            is capped at {confidenceCeiling}%.
          </>
        )}
      </p>

      <div className="flex flex-col gap-2">
        {signals.map(({ key, label, describe, statusFor }) => {
          const state = breakdown[key] ?? "absent";
          return (
            <div key={key} className="flex items-start gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2.5">
              <StatusDot status={(statusFor ?? defaultStatusFor)(state)} className="mt-1" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <span className="shrink-0 rounded-sm bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                    {state}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">{describe(state)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 self-start rounded-lg border border-accent-primary/30 bg-accent-dim p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Fused verdict</p>
        <VerdictBadge verdict={verdict as Verdict} size="lg" />
        <p className="font-mono text-2xl font-semibold text-text-primary">{confidence}%</p>
        <p className="max-w-xs text-[11px] leading-snug text-text-tertiary">{explanation}</p>
      </div>
    </div>
  );
}
