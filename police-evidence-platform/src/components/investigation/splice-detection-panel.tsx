"use client";

import { useState } from "react";
import { AlertTriangle, AudioLines, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CachedSpliceDetectionResult {
  candidates: { timestampSeconds: number; magnitude: number }[];
  totalSeconds: number;
  ranAt: string;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Real spectral-flux-based splice-point detection — the automated,
 * cached counterpart to AudioAnalyser's live waveform/spectrogram, which
 * is a real-time visual aid only (nothing computed or stored). Runs the
 * same local ml-service analysis (splice_detector.py) and lists candidate
 * timestamps where the frequency content jumps abruptly — the kind of
 * signature a cut-and-stitched edit produces, but also triggerable by a
 * genuine loud transient (a knock, a cough) — never presented as proof of
 * editing on its own.
 */
export function SpliceDetectionPanel({
  caseId,
  evidenceId,
  cached,
  onSeek,
}: {
  caseId: string;
  evidenceId: string;
  cached: CachedSpliceDetectionResult | null;
  onSeek?: (seconds: number) => void;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [result, setResult] = useState<CachedSpliceDetectionResult | null>(cached);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRun() {
    setStatus("running");
    setErrorMessage("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/detect-splices`, {
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setStatus("error");
      setErrorMessage("Could not reach the server — check your connection and try again.");
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Splice detection failed.");
      return;
    }
    const data: CachedSpliceDetectionResult = await response.json();
    setResult(data);
    setStatus("idle");
  }

  if (!result) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleRun}
          disabled={status === "running"}
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "w-fit")}
        >
          {status === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <AudioLines className="size-3.5" />}
          {status === "running" ? "Analyzing spectral content…" : "Detect splice points"}
        </button>
        {status === "error" && (
          <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-warning/30 bg-status-warning-bg px-2.5 py-1.5 text-[11px] text-status-warning">
            <AlertTriangle className="size-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-text-secondary">Splice-point detection</p>
        <button
          type="button"
          onClick={handleRun}
          disabled={status === "running"}
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0")}
        >
          {status === "running" && <Loader2 className="size-3 animate-spin" />}
          Re-run
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          Re-run failed: {errorMessage}
        </p>
      )}
      {result.candidates.length === 0 ? (
        <p className="text-text-tertiary">No abrupt spectral discontinuities detected in this clip.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {result.candidates.map((c, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSeek?.(c.timestampSeconds)}
                className="flex w-full items-center justify-between gap-2 rounded-md border border-status-warning/30 bg-status-warning-bg px-2.5 py-1.5 text-left text-status-warning hover:brightness-95"
              >
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {formatTimestamp(c.timestampSeconds)}
                </span>
                <span className="font-mono text-[10px]">{c.magnitude.toFixed(1)}σ above local baseline</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-text-tertiary">
        A real spectral-discontinuity heuristic, not a trained splice classifier — flags abrupt frequency-content
        jumps for the investigator to check by ear. Ordinary speech sounds (sharp consonants, a cough, background
        noise) can also trigger this, so some candidates in normal conversation are expected — never proof of
        editing on its own; prioritize the highest-σ entries first.
      </p>
    </div>
  );
}
