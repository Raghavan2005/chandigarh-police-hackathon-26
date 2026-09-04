"use client";

import { useState } from "react";
import { AlertTriangle, FileText, Loader2, Lock, ShieldAlert, ShieldCheck, Siren } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CachedDocumentSummary {
  summary: string;
  ranAt: string;
}

export interface CachedDocumentThreatAssessment {
  containsThreat: boolean;
  severity: "low" | "medium" | "high" | null;
  reasoning: string | null;
  quote: string | null;
  ranAt: string;
}

/**
 * Real AI analysis of a document exhibit's actual extracted text — a
 * plain-language summary (Gemini) and a threat judgment (the same
 * analyzeThreat() already used for call/video transcripts, applied here to
 * document text). Two independent on-demand actions in one panel, each
 * cached and re-runnable, same NCII/minor sensitivity gate as every other
 * external-AI-call route in this app.
 */
export function DocumentAnalysisPanel({
  caseId,
  evidenceId,
  cachedSummary,
  cachedThreat,
  sensitivityLevel,
}: {
  caseId: string;
  evidenceId: string;
  cachedSummary: CachedDocumentSummary | null;
  cachedThreat: CachedDocumentThreatAssessment | null;
  sensitivityLevel: string;
}) {
  const [summary, setSummary] = useState<CachedDocumentSummary | null>(cachedSummary);
  const [summaryStatus, setSummaryStatus] = useState<"idle" | "running" | "error">("idle");
  const [summaryError, setSummaryError] = useState("");

  const [threat, setThreat] = useState<CachedDocumentThreatAssessment | null>(cachedThreat);
  const [threatStatus, setThreatStatus] = useState<"idle" | "running" | "error">("idle");
  const [threatError, setThreatError] = useState("");

  if (sensitivityLevel !== "standard") {
    return (
      <p className="flex items-center gap-1.5 rounded-md border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-[11px] text-status-warning">
        <Lock className="size-3.5 shrink-0" />
        This evidence is flagged {sensitivityLevel === "ncii" ? "NCII" : "minor-sensitivity"} — AI document analysis
        is blocked to avoid sending its text to an external service.
      </p>
    );
  }

  async function handleSummarize() {
    setSummaryStatus("running");
    setSummaryError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/document-summary`, {
      method: "POST",
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setSummaryStatus("error");
      setSummaryError(body?.error ?? "Summarization failed.");
      return;
    }
    const data: CachedDocumentSummary = await response.json();
    setSummary(data);
    setSummaryStatus("idle");
  }

  async function handleDetectThreat() {
    setThreatStatus("running");
    setThreatError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/document-threat-detection`, {
      method: "POST",
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setThreatStatus("error");
      setThreatError(body?.error ?? "Threat detection failed.");
      return;
    }
    const data: CachedDocumentThreatAssessment = await response.json();
    setThreat(data);
    setThreatStatus("idle");
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface p-3 text-xs">
      <p className="font-medium text-text-secondary">AI document analysis</p>

      {!summary ? (
        <button
          type="button"
          onClick={handleSummarize}
          disabled={summaryStatus === "running"}
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "w-fit")}
        >
          {summaryStatus === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
          {summaryStatus === "running" ? "Summarizing…" : "Summarize document (AI)"}
        </button>
      ) : (
        <div className="rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-1.5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-text-tertiary">Summary</p>
            <button
              type="button"
              onClick={handleSummarize}
              disabled={summaryStatus === "running"}
              className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
            >
              {summaryStatus === "running" && <Loader2 className="size-3 animate-spin" />}
              Re-run
            </button>
          </div>
          <p className="text-text-secondary">{summary.summary}</p>
        </div>
      )}
      {summaryStatus === "error" && (
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          {summaryError}
        </p>
      )}

      {!threat ? (
        <button
          type="button"
          onClick={handleDetectThreat}
          disabled={threatStatus === "running"}
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "w-fit")}
        >
          {threatStatus === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <Siren className="size-3.5" />}
          {threatStatus === "running" ? "Analyzing content…" : "Detect threat (AI)"}
        </button>
      ) : threat.containsThreat ? (
        <p className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-status-critical" title={threat.reasoning ?? undefined}>
          <ShieldAlert className="size-3.5 shrink-0" />
          Possible threat ({threat.severity ?? "unspecified"} severity){threat.quote ? ` — "${threat.quote}"` : ""}
        </p>
      ) : (
        <p className="flex items-center gap-1.5 rounded-md border border-status-safe/30 bg-status-safe-bg px-2.5 py-1.5 text-status-safe">
          <ShieldCheck className="size-3.5 shrink-0" />
          No threat detected
        </p>
      )}
      {threatStatus === "error" && (
        <p role="alert" className="flex items-center gap-1.5 rounded-md border border-status-critical/30 bg-status-critical-bg px-2.5 py-1.5 text-status-critical">
          <AlertTriangle className="size-3.5 shrink-0" />
          {threatError}
        </p>
      )}
    </div>
  );
}
