"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Lock, Network } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MindMapEntity, MindMapRelationship } from "@/lib/mindmap-server";
import { MindMapGraph } from "@/components/mindmap/mindmap-graph";

export interface CachedCaseMindMap {
  entities: MindMapEntity[];
  relationships: MindMapRelationship[];
  summary: string;
  exhibitCount: number;
  ranAt: string;
}

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

/**
 * Real cross-evidence mind map (PS4_USE_CASES.md #6) — a real, billed
 * Gemini call across every real per-exhibit text already gathered on this
 * case, shown "as of <time>" with an always-available "Re-run", same
 * cached-and-re-runnable UX as ImageDescriptionPanel/DocumentAnalysisPanel.
 */
export function MindMapPanel({
  caseId,
  cached,
  sensitivityLevel,
  exhibitsWithTextCount,
  totalEvidenceCount,
}: {
  caseId: string;
  cached: CachedCaseMindMap | null;
  sensitivityLevel: string;
  exhibitsWithTextCount: number;
  totalEvidenceCount: number;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "not-configured" | "error">(
    cached ? "done" : "idle",
  );
  const [result, setResult] = useState<CachedCaseMindMap | null>(cached);
  const [errorMessage, setErrorMessage] = useState("");

  if (sensitivityLevel !== "standard") {
    return (
      <p className="flex items-center gap-1.5 rounded-md border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-xs text-status-warning">
        <Lock className="size-3.5 shrink-0" />
        This case is flagged {sensitivityLevel === "ncii" ? "NCII" : "minor-sensitivity"} — the cross-evidence mind
        map is blocked to avoid sending its evidence text to an external service.
      </p>
    );
  }

  async function handleRun() {
    setStatus("running");
    setErrorMessage("");
    const response = await fetch(`/api/cases/${caseId}/mindmap`, { method: "POST" }).catch(() => null);

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
      setErrorMessage(body?.error ?? "Mind-map synthesis failed.");
      return;
    }

    const data: CachedCaseMindMap = await response.json();
    setResult(data);
    setStatus("done");
  }

  if (!result) {
    if (status === "not-configured") {
      return (
        <p className="rounded-md border border-dashed border-border-subtle px-3 py-2 text-xs text-text-tertiary">
          Cross-evidence mind map isn&apos;t configured on this deployment (no Gemini credentials set) — a real
          capability, not built by default since it requires a billed external service.
        </p>
      );
    }

    if (exhibitsWithTextCount === 0) {
      return (
        <p className="rounded-md border border-dashed border-border-subtle px-3 py-2 text-xs text-text-tertiary">
          None of this case&apos;s {totalEvidenceCount} exhibit{totalEvidenceCount === 1 ? "" : "s"} have any
          analyzed text yet (a transcript, an AI image description, a face note, or document text/summary) — there
          is nothing to synthesize a mind map from. Run one of those exhibit-level analyses first, then come back
          here.
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
      <div className="flex flex-col gap-2">
        <p className="text-xs text-text-tertiary">
          {exhibitsWithTextCount} of {totalEvidenceCount} exhibit{totalEvidenceCount === 1 ? "" : "s"} on this case
          have analyzed text available to synthesize across.
        </p>
        <button
          type="button"
          onClick={handleRun}
          disabled={status === "running"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          {status === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <Network className="size-3.5" />}
          {status === "running" ? "Synthesizing across exhibits…" : "Generate mind map (AI)"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-text-tertiary">
            Synthesized from {result.exhibitCount} of {totalEvidenceCount} exhibit{totalEvidenceCount === 1 ? "" : "s"}{" "}
            — results as of {formatRelativeTime(result.ranAt)} ({new Date(result.ranAt).toLocaleString()}), not
            re-checked automatically as new evidence is added.
          </p>
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
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-xs text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          Re-run failed: {errorMessage} (showing the last successful result below.)
        </p>
      )}
      {status === "not-configured" && (
        <p className="rounded-md border border-dashed border-border-subtle px-2.5 py-1.5 text-xs text-text-tertiary">
          Re-run unavailable — credentials were removed since the cached result below was fetched.
        </p>
      )}

      <div className="rounded-md border border-border-subtle bg-surface p-3 text-xs">
        <p className="mb-1.5 font-medium text-text-secondary">Case summary (AI)</p>
        <p className="text-text-secondary">{result.summary}</p>
        <p className="mt-2 text-[10px] text-text-tertiary">
          A best-effort synthesis grounded only in this case&apos;s already-analyzed exhibit text, not independent
          research — treat named entities/relationships as investigative leads to verify, never as confirmed fact.
        </p>
      </div>

      <MindMapGraph entities={result.entities} relationships={result.relationships} />
    </div>
  );
}
