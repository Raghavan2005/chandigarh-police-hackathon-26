"use client";

import { useState } from "react";
import { AlertTriangle, GitCompareArrows, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CachedVideoDiffResult {
  matchedEvidenceId: string;
  diffPercentage: number;
  timestampSeconds: number;
  ranAt: string;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Real pixel diff against the most-similar real cross-case match, at the
 * same timestamp the primary heatmap already flags as most suspicious.
 * Only ever offered when a real EvidenceMatch exists with an actual file
 * on disk — seeded-corpus-only matches get an honest 422 explaining why no
 * diff is possible (CorpusItem only stores a thumbnail), never a fake
 * diff. Cached like every other on-demand analysis here, re-runnable.
 */
export function VideoDiffPanel({
  caseId,
  evidenceId,
  cached,
}: {
  caseId: string;
  evidenceId: string;
  cached: CachedVideoDiffResult | null;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [result, setResult] = useState<CachedVideoDiffResult | null>(cached);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRun() {
    setStatus("running");
    setErrorMessage("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/video-diff`, {
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
      setErrorMessage(body?.error ?? "Video diff failed.");
      return;
    }
    const data: CachedVideoDiffResult = await response.json();
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
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          {status === "running" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <GitCompareArrows className="size-3.5" />
          )}
          {status === "running" ? "Comparing against matched original…" : "Diff against matched original"}
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

  const diffImageUrl = `/api/cases/${caseId}/evidence/${evidenceId}/video-diff/image`;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-text-secondary">Diff against matched original</p>
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
      <p className="text-[10px] text-text-tertiary">
        At {formatTimestamp(result.timestampSeconds)} — {result.diffPercentage.toFixed(1)}% of pixels differ from the
        matched exhibit at the same timestamp. Highlighted pixels below are the difference, not necessarily the
        manipulated region — a best-effort visual diff, not frame-registration-corrected.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={diffImageUrl}
        alt="Pixel diff against matched original"
        className="w-full max-w-sm rounded-md border border-border-subtle bg-black"
      />
    </div>
  );
}
