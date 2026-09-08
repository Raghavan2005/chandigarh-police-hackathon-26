"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Lock, Network } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatTimestamp } from "@/lib/utils";
import type { MindMapNode, MindMapEdge } from "@/lib/mindmap-server";
import { MindMapGraph, MindMapTimeline } from "@/components/mindmap/mindmap-graph";

export interface CachedCaseMindMap {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
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
 * Real cross-evidence case graph (PS4_USE_CASES.md #6), redefined from a
 * single flat AI-entity-extraction call into two layers: a `structural`
 * graph (exhibits, verdicts, corpus/cross-case matches, web-search
 * sources) computed server-side with zero cost and shown immediately —
 * real and useful even with no Gemini credentials configured and before
 * any AI call ever runs — plus an opt-in AI-inferred entity/relationship
 * layer merged on top and cached once run. This is the fix for "looks
 * like a name-sake": the graph is never empty just because no external
 * service has been called yet.
 */
export function MindMapPanel({
  caseId,
  cached,
  structural,
  sensitivityLevel,
  exhibitsWithTextCount,
  totalEvidenceCount,
}: {
  caseId: string;
  cached: CachedCaseMindMap | null;
  structural: { nodes: MindMapNode[]; edges: MindMapEdge[] };
  sensitivityLevel: string;
  exhibitsWithTextCount: number;
  totalEvidenceCount: number;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "not-configured" | "error">(
    cached ? "done" : "idle",
  );
  const [result, setResult] = useState<CachedCaseMindMap | null>(cached);
  const [errorMessage, setErrorMessage] = useState("");

  const sensitive = sensitivityLevel !== "standard";

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

  // A cached AI-inferred result generated before this case was flagged
  // sensitive must not still display once it is — the sensitivity gate has
  // to apply to what's shown, not just to whether a new call can be made.
  // Falls back to the (always-safe, never-externally-sent) structural
  // graph exactly as if no AI run had ever happened.
  const activeResult = sensitive ? null : result;
  const activeNodes = activeResult?.nodes ?? structural.nodes;
  const activeEdges = activeResult?.edges ?? structural.edges;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-tertiary">
          {activeResult ? (
            <>
              Includes AI-inferred entities — synthesized from {activeResult.exhibitCount} of {totalEvidenceCount} exhibit
              {totalEvidenceCount === 1 ? "" : "s"}, as of {formatRelativeTime(activeResult.ranAt)} (
              {formatTimestamp(new Date(activeResult.ranAt))}). The structural half (exhibits, verdicts, matches, web
              sources) is recomputed fresh on re-run; the AI-inferred half is not re-checked automatically as new
              evidence is added.
            </>
          ) : (
            <>
              Real, structural graph — {totalEvidenceCount} exhibit{totalEvidenceCount === 1 ? "" : "s"}, their
              verdicts, and every corpus/cross-case/web-search match, always current, no external call involved.
            </>
          )}
        </p>
        {!sensitive && (
          <button
            type="button"
            onClick={handleRun}
            disabled={status === "running"}
            className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0")}
          >
            {status === "running" ? <Loader2 className="size-3 animate-spin" /> : <Network className="size-3" />}
            {status === "running" ? "Synthesizing…" : result ? "Re-run AI layer" : "Add AI-inferred entities"}
          </button>
        )}
      </div>

      {sensitive && (
        <p className="flex items-center gap-1.5 rounded-md border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-xs text-status-warning">
          <Lock className="size-3.5 shrink-0" />
          This case is flagged {sensitivityLevel === "ncii" ? "NCII" : "minor-sensitivity"} — the AI-inferred entity
          layer is blocked to avoid sending its evidence text to an external service. The structural graph below
          never leaves this platform, so it&apos;s still shown in full.
        </p>
      )}

      {status === "not-configured" && (
        <p className="rounded-md border border-dashed border-border-subtle px-2.5 py-1.5 text-xs text-text-tertiary">
          AI entity/relationship extraction isn&apos;t configured on this deployment (no Cognition Engine credentials set) —
          the structural graph below is real and unaffected.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-xs text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}
      {!sensitive && !result && exhibitsWithTextCount === 0 && (
        <p className="rounded-md border border-dashed border-border-subtle px-2.5 py-1.5 text-xs text-text-tertiary">
          None of this case&apos;s {totalEvidenceCount} exhibit{totalEvidenceCount === 1 ? "" : "s"} have analyzed
          text yet (a transcript, AI image description, face note, or document text/summary), so there&apos;s
          nothing for the AI layer to extract entities from — run one of those exhibit-level analyses first if you
          want named-entity extraction, or just use the structural graph below as-is.
        </p>
      )}

      {activeResult && (
        <div className="rounded-md border border-border-subtle bg-surface p-3 text-xs">
          <p className="mb-1.5 font-medium text-text-secondary">Case summary (AI)</p>
          <p className="text-text-secondary">{activeResult.summary}</p>
          <p className="mt-2 text-[10px] text-text-tertiary">
            A best-effort synthesis grounded only in this case&apos;s already-analyzed exhibit text plus its real
            verdicts/match counts, not independent research — treat named entities/relationships as investigative
            leads to verify, never as confirmed fact.
          </p>
        </div>
      )}

      <MindMapGraph nodes={activeNodes} edges={activeEdges} />
      <MindMapTimeline nodes={activeNodes} />
    </div>
  );
}
