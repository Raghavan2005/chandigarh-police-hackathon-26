"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, ScanEye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CachedImageDescriptionResult } from "@/lib/image-description";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const CONFIDENCE_STYLE: Record<string, string> = {
  high: "border-status-critical/30 bg-status-critical-bg text-status-critical",
  medium: "border-status-warning/30 bg-status-warning-bg text-status-warning",
  low: "border-border-subtle bg-surface text-text-tertiary",
};

/**
 * Real AI image description (Vertex AI Gemini) — the one capability able
 * to put a name to a recognizable person at all, since Cloud Vision (the
 * reverse-image search above) has no face/identity feature. A model's
 * best-effort visual judgment, not a verified biometric match — every
 * name is shown as a lead with its own stated confidence and reasoning,
 * never as a confirmed identification. Cached the same way as reverse-
 * image search: a real, billed external call, shown "as of <time>," with
 * an always-available "Re-run."
 */
export function ImageDescriptionPanel({
  caseId,
  evidenceId,
  cached,
}: {
  caseId: string;
  evidenceId: string;
  cached: CachedImageDescriptionResult | null;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "not-configured" | "error">(
    cached ? "done" : "idle",
  );
  const [result, setResult] = useState<CachedImageDescriptionResult | null>(cached);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRun() {
    setStatus("running");
    setErrorMessage("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/describe-image`, {
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setStatus("error");
      setErrorMessage("Could not reach the server — check your connection and try again.");
      return;
    }
    if (response.status === 501) {
      setStatus("not-configured");
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Image description failed.");
      return;
    }

    const data: CachedImageDescriptionResult = await response.json();
    setResult(data);
    setStatus("done");
  }

  if (!result) {
    if (status === "not-configured") {
      return (
        <p className="rounded-md border border-dashed border-border-subtle px-3 py-2 text-[11px] text-text-tertiary">
          AI image description isn&apos;t configured on this deployment (no GCP credentials set) — a real capability,
          not built by default since it requires a billed external service.
        </p>
      );
    }
    if (status === "error") {
      return (
        <div className="flex flex-col gap-1.5">
          <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-xs text-status-critical">
            <AlertTriangle className="size-3.5 shrink-0" />
            {errorMessage}
          </p>
          <button type="button" onClick={handleRun} className={cn(buttonVariants({ variant: "outline", size: "xs" }), "w-fit")}>
            Retry
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={handleRun}
        disabled={status === "running"}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
      >
        {status === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <ScanEye className="size-3.5" />}
        {status === "running" ? "Asking the model to describe this image…" : "Describe image / identify people (AI)"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-text-secondary">AI image description (Vertex AI Gemini)</p>
          {result?.ranAt && (
            <p className="text-[10px] text-text-tertiary">
              Results as of {formatRelativeTime(result.ranAt)} ({new Date(result.ranAt).toLocaleString()}) — not
              re-checked automatically.
            </p>
          )}
        </div>
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
          Re-run failed: {errorMessage} (showing the last successful result below.)
        </p>
      )}
      {status === "not-configured" && (
        <p className="rounded-md border border-dashed border-border-subtle px-2.5 py-1.5 text-text-tertiary">
          Re-run unavailable — credentials were removed since the cached result below was fetched.
        </p>
      )}

      <p className="text-text-secondary">{result.description}</p>

      {result.possibleIdentities.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-medium text-text-tertiary">Possible identity — unverified AI lead, not a confirmed match</p>
          {result.possibleIdentities.map((p, i) => (
            <div key={i} className="rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{p.name}</span>
                <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide", CONFIDENCE_STYLE[p.confidence])}>
                  {p.confidence} confidence
                </span>
              </div>
              <p className="mt-1 text-[10px] text-text-tertiary">{p.reasoning}</p>
            </div>
          ))}
          <p className="text-[10px] text-text-tertiary">
            AI best-effort visual judgment, not biometric face recognition or a verified identity match — the model
            can be wrong or mistake a lookalike. Treat as a lead to independently verify, never cite on its own.
          </p>
        </div>
      ) : (
        <p className="text-text-tertiary">No individual in this image was confidently recognizable to the model.</p>
      )}
    </div>
  );
}
