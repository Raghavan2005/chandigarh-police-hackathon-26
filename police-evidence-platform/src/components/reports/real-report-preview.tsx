"use client";

import Image from "next/image";
import { Download, FileJson, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { getRealCase, getRealCaseAuditLog } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type AuditEntries = Awaited<ReturnType<typeof getRealCaseAuditLog>>;

/**
 * Report for a real, Phase-1/2-created case — built from actual DB data,
 * not mock-data.ts. Deliberately does NOT yet implement the full bilingual
 * Section 63 BSA certificate structure from PS4_MVP_BUILD_PLAN.md §4 (Part
 * A/B declarations, Hindi translations) — that's separate, larger work not
 * done yet. This shows real case/evidence/audit data honestly instead,
 * with a plain note about what's still missing, rather than silently
 * reusing the old mock report (which is what this replaces).
 */
export function RealReportPreview({ caseData, auditLog }: { caseData: RealCase; auditLog: AuditEntries }) {
  const downloadJson = () => {
    const payload = {
      case: {
        id: caseData.id,
        firNumber: caseData.firNumber,
        policeStation: caseData.policeStation,
        district: caseData.district,
        title: caseData.title,
        summary: caseData.summary,
        evidenceKind: caseData.evidenceKind,
        status: caseData.status,
        sensitivityLevel: caseData.sensitivityLevel,
        investigator: caseData.investigator.name,
        investigatorRank: caseData.investigatorRank,
        investigatorBadgeNo: caseData.investigatorBadgeNo,
        openedAt: caseData.openedAt,
      },
      evidence: caseData.evidence.map((ev) => ({
        id: ev.id,
        sha256: ev.sha256,
        mimeType: ev.mimeType,
        uploadedBy: ev.uploadedBy.name,
        uploadedAt: ev.uploadedAt,
        metadata: ev.metadataResult,
        detection: ev.detectionResult,
        provenance: ev.provenanceResult,
        verdict: ev.fusionVerdict,
        overrides: ev.overrides,
      })),
      auditLog: auditLog.map((a) => ({
        timestamp: a.timestamp,
        actor: a.actor?.name ?? "system",
        action: a.action,
        evidenceHash: a.evidenceHash,
        device: a.device,
        entryHash: a.entryHash,
      })),
      generatedAt: new Date().toISOString(),
      disclaimer:
        "Investigative triage aid — real case data, not yet a certified Section 63 BSA evidentiary document (bilingual certificate format pending).",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseData.id}-evidence-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-text-secondary">
          Real case data. The full bilingual Section 63 BSA evidentiary certificate isn&apos;t built yet — see the
          note at the bottom of this report.
        </p>
        <div className="flex gap-2">
          <button onClick={downloadJson} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <FileJson className="size-4" />
            Export JSON
          </button>
          <button
            onClick={() => window.print()}
            className={cn(buttonVariants({ size: "sm" }), "bg-accent-primary text-white hover:bg-accent-primary-hover")}
          >
            <Printer className="size-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[820px] rounded-md bg-white text-neutral-900 shadow-2xl print:shadow-none">
        <div className="flex items-center justify-between border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center gap-3">
            <Image src="/Chandigarh_Police_Logo.png" alt="Chandigarh Police" width={40} height={40} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Chandigarh Police — Pramana Forensic Evidence Platform
              </p>
              <h2 className="text-lg font-semibold">Investigation Report</h2>
            </div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <p>Case {caseData.id}</p>
            <p>Generated {new Date().toISOString().slice(0, 10)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Case & FIR particulars</p>
            <p className="mt-1 text-sm font-medium">{caseData.title}</p>
            {caseData.summary && <p className="mt-1 text-xs leading-relaxed text-neutral-600">{caseData.summary}</p>}
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-neutral-600">
              <dt>FIR number</dt>
              <dd className="text-neutral-900">{caseData.firNumber}</dd>
              <dt>Police station</dt>
              <dd className="text-neutral-900">{caseData.policeStation}</dd>
              <dt>District/UT</dt>
              <dd className="text-neutral-900">{caseData.district}</dd>
              <dt>Investigator</dt>
              <dd className="text-neutral-900">
                {caseData.investigator.name}
                {caseData.investigatorRank ? ` (${caseData.investigatorRank})` : ""}
              </dd>
              <dt>Status</dt>
              <dd className="capitalize text-neutral-900">{caseData.status}</dd>
              <dt>Opened</dt>
              <dd className="text-neutral-900">{new Date(caseData.openedAt).toLocaleString()}</dd>
            </dl>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Evidence ({caseData.evidence.length})
            </p>
            <div className="mt-2 flex flex-col gap-3">
              {caseData.evidence.length === 0 && (
                <p className="text-xs text-neutral-500">No evidence on this case.</p>
              )}
              {caseData.evidence.map((ev) => (
                <div key={ev.id} className="rounded border border-neutral-200 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900">{ev.mimeType}</span>
                    {ev.fusionVerdict ? (
                      <span className="font-mono text-neutral-700">
                        {ev.fusionVerdict.verdict.replace("_", "-")} · {ev.fusionVerdict.confidence}%
                      </span>
                    ) : (
                      <span className="text-neutral-400">Analysis pending</span>
                    )}
                  </div>
                  <p className="mt-1 break-all font-mono text-[10px] text-neutral-500">SHA-256: {ev.sha256}</p>
                  {ev.metadataResult && (
                    <p className="mt-1 text-neutral-600">
                      {[ev.metadataResult.container, ev.metadataResult.resolution, ev.metadataResult.duration, ev.metadataResult.codec]
                        .filter(Boolean)
                        .join(" · ")}
                      {ev.metadataResult.encoderSignature && (
                        <span className="ml-1 font-medium text-amber-700">
                          — encoder: {ev.metadataResult.encoderSignature}
                        </span>
                      )}
                    </p>
                  )}
                  {ev.provenanceResult && (
                    <p className="mt-1 text-neutral-600">
                      C2PA:{" "}
                      {ev.provenanceResult.c2paPresent
                        ? ev.provenanceResult.c2paValid
                          ? "valid credential present"
                          : "credential present but invalid"
                        : "no credential present"}
                    </p>
                  )}
                  {ev.fusionVerdict && (
                    <p className="mt-1 text-neutral-600">{ev.fusionVerdict.explanation}</p>
                  )}
                  {ev.overrides.length > 0 && (
                    <div className="mt-2 border-t border-dashed border-neutral-200 pt-1.5">
                      <p className="font-medium text-neutral-700">Human override</p>
                      {ev.overrides.map((o) => (
                        <p key={o.id} className="text-neutral-600">
                          {o.previousVerdict.replace("_", "-")} → {o.newVerdict.replace("_", "-")} by{" "}
                          {o.overriddenBy.name}: {o.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Chain of custody</p>
            <ul className="mt-1.5 space-y-1 text-xs text-neutral-600">
              {auditLog.length === 0 && <li className="text-neutral-400">No audit entries.</li>}
              {auditLog.map((a) => (
                <li key={a.id} className="flex justify-between gap-2 border-b border-dashed border-neutral-100 py-1">
                  <span>
                    {a.actor?.name ?? "system"} — {a.action.toLowerCase()}
                  </span>
                  <span className="font-mono text-neutral-400">{new Date(a.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-[11px] leading-snug text-amber-900">
            This report reflects real case, evidence, and audit data from the platform database. It is an
            investigative triage aid, not yet a certified Section 63 BSA evidentiary document — the bilingual
            (English + Hindi) two-part certificate structure specified in PS4_MVP_BUILD_PLAN.md §4 is separate work
            still in progress. Human review required before any evidentiary use.
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 px-8 py-4 text-xs text-neutral-500">
          <span>Signed off by {caseData.investigator.name}</span>
          <span className="flex items-center gap-1">
            <Download className="size-3" /> Pramana v0.1 — build in progress
          </span>
        </div>
      </div>
    </div>
  );
}
