import { StatusDot } from "@/components/shared/status-dot";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import type { Verdict } from "@/lib/types";

type SignalState = "fired" | "absent" | "contradicted";

const SIGNAL_LABEL: Record<string, string> = {
  metadata: "Metadata consistency",
  c2pa: "C2PA / Provenance",
  hashMatch: "Hash / corpus match",
};

function statusFor(state: SignalState): "critical" | "warning" | "neutral" {
  if (state === "fired") return "critical";
  if (state === "contradicted") return "warning";
  return "neutral";
}

function describe(key: string, state: SignalState): string {
  if (key === "metadata") {
    return state === "fired"
      ? "Editing-software signature found on the file (e.g. professional encoder on claimed-raw footage)."
      : "No inconsistency in the file's metadata.";
  }
  if (key === "c2pa") {
    if (state === "contradicted") return "A Content Credential is present but failed validation.";
    return "No Content Credential present — neutral, not suspicious (most real evidence has none).";
  }
  if (key === "hashMatch") {
    return state === "fired"
      ? "This file matches another item in the seeded corpus or another case."
      : "No matching file found yet.";
  }
  return "";
}

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
}: {
  signalBreakdownJson: string;
  coverageCount: number;
  confidenceCeiling: number;
  verdict: string;
  confidence: number;
  explanation: string;
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
        The classifier score is capped by how many of the three signals below actually corroborate it — not
        averaged with fixed weights. With {coverageCount} of 3 signals corroborating, confidence is capped at{" "}
        {confidenceCeiling}%.
      </p>

      <div className="flex flex-col gap-2">
        {Object.entries(SIGNAL_LABEL).map(([key, label]) => {
          const state = breakdown[key] ?? "absent";
          return (
            <div key={key} className="flex items-start gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2.5">
              <StatusDot status={statusFor(state)} className="mt-1" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <span className="shrink-0 rounded-sm bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                    {state}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">{describe(key, state)}</p>
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
