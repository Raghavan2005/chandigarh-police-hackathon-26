"use client";

import Image from "next/image";
import { Download, FileJson, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fusionSignals,
  fusionSignalsByCase,
  propagationNodes,
  propagationNodesByCase,
  faceMatches,
  faceMatchesByCase,
  auditLog,
  auditLogByCase,
} from "@/lib/mock-data";
import type { CaseSummary } from "@/lib/types";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ReportPreview({ caseData }: { caseData: CaseSummary }) {
  const signals = fusionSignalsByCase[caseData.id] ?? fusionSignals;
  const nodes = propagationNodesByCase[caseData.id] ?? propagationNodes;
  const earliestNode = nodes.find((n) => n.isEarliest) ?? nodes[0];
  const matches = faceMatchesByCase[caseData.id] ?? faceMatches;
  const custody = auditLogByCase[caseData.id] ?? auditLog;
  const showMatches =
    caseData.evidenceKind === "video" || caseData.evidenceKind === "image";

  const downloadJson = () => {
    const payload = {
      case: caseData,
      signals,
      propagation: nodes,
      faceMatches: showMatches ? matches : undefined,
      auditLog: custody,
      generatedAt: new Date().toISOString(),
      disclaimer:
        "Synthetic demo data — investigative triage aid, not certified evidence.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseData.id}-evidence-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Structured, evidence-grade report generated from this case&apos;s
          fused signals and audit trail.
        </p>
        <div className="flex gap-2">
          <button
            onClick={downloadJson}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <FileJson className="size-4" />
            Export JSON
          </button>
          <button
            onClick={() => window.print()}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-accent-primary text-white hover:bg-accent-primary-hover",
            )}
          >
            <Printer className="size-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Deliberately light-background, print-styled — an evidentiary
          document should read like a report, not like the dark console. */}
      <div className="mx-auto w-full max-w-[820px] rounded-md bg-white text-neutral-900 shadow-2xl print:shadow-none">
        <div className="flex items-center justify-between border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/Chandigarh_Police_Logo.png"
              alt="Chandigarh Police"
              width={40}
              height={40}
            />
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

        <div className="grid grid-cols-3 gap-6 px-8 py-6">
          <div className="col-span-2 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Case summary
              </p>
              <p className="mt-1 text-sm font-medium">{caseData.title}</p>
              {caseData.summary && (
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  {caseData.summary}
                </p>
              )}
              <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-neutral-600">
                <dt>Investigator</dt>
                <dd className="text-neutral-900">{caseData.investigator}</dd>
                <dt>Evidence type</dt>
                <dd className="capitalize text-neutral-900">{caseData.evidenceKind}</dd>
                <dt>Status</dt>
                <dd className="capitalize text-neutral-900">{caseData.status}</dd>
                <dt>Opened</dt>
                <dd className="text-neutral-900">{caseData.updatedRelative}</dd>
              </dl>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Signal breakdown
              </p>
              <table className="mt-2 w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="py-1.5 font-medium">Signal</th>
                    <th className="py-1.5 font-medium">Weight</th>
                    <th className="py-1.5 font-medium">Finding</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s) => (
                    <tr key={s.id} className="border-b border-neutral-100">
                      <td className="py-1.5 pr-2 font-medium">{s.label}</td>
                      <td className="py-1.5 pr-2 text-neutral-600">{s.weight}%</td>
                      <td className="py-1.5 text-neutral-600">{s.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showMatches && matches.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  OSINT / reverse-search findings
                </p>
                <ul className="mt-1.5 space-y-1.5 text-xs text-neutral-600">
                  {matches.map((m) => (
                    <li key={m.id} className="border-b border-dashed border-neutral-100 pb-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-neutral-900">{m.title}</span>
                        <span className="shrink-0 font-mono text-neutral-500">
                          {m.confidence}% match
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        {m.url} · first seen {m.firstSeen}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Propagation summary
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Earliest known occurrence:{" "}
                <span className="font-medium text-neutral-900">
                  {capitalize(earliestNode.platform)} · {earliestNode.timestamp}
                </span>
                . Spread confirmed across {nodes.length} sources.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Chain of custody
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-neutral-600">
                {custody.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2 border-b border-dashed border-neutral-100 py-1">
                    <span>
                      {a.actor} — {a.action.toLowerCase()}
                    </span>
                    <span className="font-mono text-neutral-400">{a.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-md border border-neutral-200">
              <Image
                src={caseData.thumbnail}
                alt=""
                width={240}
                height={160}
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="rounded-md border border-neutral-200 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                Verdict
              </p>
              <p className="mt-1 text-base font-semibold">
                {caseData.verdict.replace("_", "-")}
              </p>
              <p className="font-mono text-2xl font-bold">{caseData.confidence}%</p>
            </div>
            {caseData.verdictExplanation && (
              <div className="rounded-md border border-neutral-200 p-3 text-[11px] leading-snug text-neutral-600">
                {caseData.verdictExplanation}
              </div>
            )}
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-[11px] leading-snug text-amber-900">
              Investigative triage aid — not certified evidence. Synthetic
              demo data. Human review required before action.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 px-8 py-4 text-xs text-neutral-500">
          <span>Signed off by {caseData.investigator}</span>
          <span className="flex items-center gap-1">
            <Download className="size-3" /> Pramana v0.1 — demo build
          </span>
        </div>
      </div>
    </div>
  );
}
