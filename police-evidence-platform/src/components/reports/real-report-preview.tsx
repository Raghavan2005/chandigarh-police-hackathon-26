"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Download, FileJson, Loader2, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDateOnly, formatTimestamp } from "@/lib/utils";
import type { getRealCase, getRealCaseAuditLog } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type AuditEntries = Awaited<ReturnType<typeof getRealCaseAuditLog>>;

/** Small helper for the fixed structural labels/headers/certificate text
 * that PS4_MVP_BUILD_PLAN.md §4 specifies as bilingual (English + Hindi) —
 * everything load-bearing for the Section 63 BSA certificate. Dynamic,
 * generated narrative (case summary, fusion explanations) deliberately
 * stays English-only per that same section's explicit scope decision —
 * mistranslating free-form legal narrative automatically is riskier than
 * not translating it, and nobody on the team has reviewed Hindi output
 * against a native/legal speaker yet.
 */
function Bi({ en, hi, className }: { en: string; hi: string; className?: string }) {
  return (
    <span className={className}>
      {en} <span lang="hi">/ {hi}</span>
    </span>
  );
}

function signalLabel(key: string): string {
  if (key === "metadata") return "Metadata consistency";
  if (key === "c2pa") return "C2PA / Provenance";
  if (key === "hashMatch") return "Hash / corpus match";
  return key;
}

type ExhibitEvidence = RealCase["evidence"][number];

/**
 * Real exhibit picture for the printed report — the actual uploaded image
 * for image evidence, or the real sampled-frame Grad-CAM heatmap for
 * video (the same derivative already shown in the live case view), never
 * a generic file-type icon standing in for "the evidence." Audio/document
 * evidence has no honest visual to show, so this returns null for those
 * rather than a fabricated placeholder image.
 */
function exhibitThumbnail(caseId: string, ev: ExhibitEvidence): { url: string; caption: string } | null {
  if (ev.mimeType.startsWith("image/")) {
    return { url: `/api/cases/${caseId}/evidence/${ev.id}/file`, caption: "As uploaded" };
  }
  if (ev.mimeType.startsWith("video/") && ev.detectionResult?.heatmapPath) {
    return {
      url: `/api/cases/${caseId}/evidence/${ev.id}/heatmap`,
      caption: "Sampled frame analyzed (Grad-CAM heatmap overlay)",
    };
  }
  return null;
}

/**
 * Report for a real, Phase-1/2-created case — built from actual DB data,
 * now implementing the full bilingual Section 63 BSA (Bharatiya Sakshya
 * Adhiniyam, 2023) evidentiary certificate structure from
 * PS4_MVP_BUILD_PLAN.md §4: header, case/IO particulars, exhibit
 * particulars, technical findings, chain of custody, the Part A/B
 * certificate per exhibit, sign-off block, and the mandatory legal-status
 * footer. Every field either comes from real DB data or is a fixed
 * declaration/template string — nothing here is a fabricated finding.
 */
export function RealReportPreview({
  caseData,
  auditLog,
  integrityHash,
  qrDataUrl,
}: {
  caseData: RealCase;
  auditLog: AuditEntries;
  integrityHash: string;
  qrDataUrl: string;
}) {
  const generatedAt = new Date();
  const [pdfStatus, setPdfStatus] = useState<"idle" | "rendering" | "error">("idle");
  const [pdfError, setPdfError] = useState("");
  const [jsonStatus, setJsonStatus] = useState<"idle" | "downloading" | "error">("idle");
  const [jsonError, setJsonError] = useState("");

  // Fetches from GET /api/cases/:id/report.json — the single source of
  // truth for the export payload (PS4_MVP_BUILD_PLAN.md §5) — instead of
  // re-building the same shape client-side, and writes a real EXPORTED
  // audit entry as a side effect (closes the "Audit log wired to every
  // real action" gap: export previously had no server round-trip at all).
  const downloadJson = async () => {
    setJsonStatus("downloading");
    setJsonError("");
    const response = await fetch(`/api/cases/${caseData.id}/report.json`).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setJsonStatus("error");
      setJsonError(body?.error ?? "JSON export failed — check your connection and try again.");
      return;
    }
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseData.id}-evidence-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    setJsonStatus("idle");
  };

  // Real server-rendered PDF (GET /api/cases/:id/report.pdf) — a headless
  // Chrome renders the same authenticated report page a human would print,
  // and writes a real EXPORTED audit entry server-side. Replaces
  // window.print(), which nothing server-side can verify actually
  // happened or with what content, unlike this — a real PDF file this
  // component can genuinely fail to produce and report that failure.
  const downloadPdf = async () => {
    setPdfStatus("rendering");
    setPdfError("");
    const response = await fetch(`/api/cases/${caseData.id}/report.pdf`).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setPdfStatus("error");
      setPdfError(body?.error ?? "PDF export failed — check your connection and try again.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseData.id}-evidence-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setPdfStatus("idle");
  };

  // Sequential paragraph numbers matching the authentic Indian
  // legal/government-document convention of numbered clauses (verified
  // against real 65B/BSA affidavit templates) -- computed rather than
  // hardcoded so the numbering stays correct whether or not the optional
  // case-summary paragraph renders.
  let sectionCounter = 1;
  const nextSection = () => sectionCounter++;
  const particularsSection = nextSection();
  const summarySection = caseData.summary ? nextSection() : null;
  const executiveSummarySection = nextSection();
  const exhibitsSection = nextSection();
  const custodySection = nextSection();
  const certificateSection = nextSection();
  const signOffSection = nextSection();

  // Executive summary — a report with several exhibits at different
  // verdicts previously had no top-line count anywhere; a reader had to
  // open every exhibit block individually to know the overall picture.
  const verdictCounts: Record<string, number> = {};
  for (const ev of caseData.evidence) {
    const key = ev.fusionVerdict?.verdict ?? "PENDING";
    verdictCounts[key] = (verdictCounts[key] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-text-secondary">
          Real case data, structured as a Section 63 BSA evidentiary certificate draft. Human signature required
          before evidentiary use — see the legal-status footer below.
        </p>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-2">
            <button
              onClick={downloadJson}
              disabled={jsonStatus === "downloading"}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {jsonStatus === "downloading" ? <Loader2 className="size-4 animate-spin" /> : <FileJson className="size-4" />}
              {jsonStatus === "downloading" ? "Preparing JSON…" : "Export JSON"}
            </button>
            <button
              onClick={downloadPdf}
              disabled={pdfStatus === "rendering"}
              className={cn(buttonVariants({ size: "sm" }), "bg-accent-primary text-white hover:bg-accent-primary-hover")}
            >
              {pdfStatus === "rendering" ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
              {pdfStatus === "rendering" ? "Rendering PDF…" : "Export PDF"}
            </button>
          </div>
          {jsonStatus === "error" && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {jsonError}
            </p>
          )}
          {pdfStatus === "error" && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {pdfError}
            </p>
          )}
        </div>
      </div>

      <div className="report-document mx-auto w-full max-w-[820px] border-4 border-double border-neutral-800 bg-white text-neutral-900 shadow-2xl print:shadow-none">
        {/* 1. Header — memo-number convention: "No. .../year" left, date right,
            matching the reference-number style used on real government
            office correspondence (verified against real 65B/BSA affidavit
            and departmental-memo formats, not guessed). */}
        <div className="border-b-2 border-neutral-800 px-8 py-6">
          <div className="flex items-center justify-center gap-3 border-b border-neutral-300 pb-4 text-center">
            <Image src="/Chandigarh_Police_Logo.png" alt="Chandigarh Police" width={44} height={44} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <Bi en="Chandigarh Police — Pramana Forensic Evidence Platform" hi="चंडीगढ़ पुलिस — प्रमाण फोरेंसिक साक्ष्य प्लेटफ़ॉर्म" />
              </p>
              <h2 className="text-xl font-bold uppercase tracking-wide">
                <Bi en="Investigation Report" hi="अन्वेषण रिपोर्ट" />
              </h2>
            </div>
          </div>
          <div className="mt-3 flex items-start justify-between text-xs text-neutral-600">
            <p>
              {caseData.dispatchNumber ? (
                <>
                  <Bi en="Dispatch No." hi="प्रेषण क्रमांक" />: <span className="font-mono">{caseData.dispatchNumber}</span>
                </>
              ) : (
                <>
                  <Bi en="System reference (provisional)" hi="सिस्टम संदर्भ (अनंतिम)" />:{" "}
                  <span className="font-mono">
                    PRAMANA/{caseData.id}/{generatedAt.getFullYear()}
                  </span>
                  <span className="ml-1 text-[10px] text-neutral-400">
                    — not yet assigned an office dispatch/DAK number
                  </span>
                </>
              )}
            </p>
            <p>
              <Bi en="Dated" hi="दिनांक" />: {generatedAt.toISOString().slice(0, 10)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          {/* 2. Case & IO particulars */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {particularsSection}. <Bi en="Case & investigating officer particulars" hi="मामला एवं अन्वेषण अधिकारी विवरण" />
            </p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-700">
              <Bi
                en={`This report has been prepared by ${caseData.investigator.name}${caseData.investigatorRank ? `, ${caseData.investigatorRank}` : ""}${caseData.investigatorBadgeNo ? ` (Badge/PIS No. ${caseData.investigatorBadgeNo})` : ""}, presently posted at ${caseData.policeStation}, ${caseData.district}, in connection with FIR No. ${caseData.firNumber}${caseData.offenceSections ? ` under ${caseData.offenceSections}` : ""}, regarding the matter titled "${caseData.title}".`}
                hi={`यह रिपोर्ट ${caseData.investigator.name}${caseData.investigatorRank ? `, ${caseData.investigatorRank}` : ""} द्वारा तैयार की गई है, जो वर्तमान में ${caseData.policeStation}, ${caseData.district} में पदस्थ हैं, प्राथमिकी संख्या ${caseData.firNumber} के संबंध में।`}
              />
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-neutral-600">
              <dt><Bi en="FIR No." hi="प्राथमिकी संख्या" /></dt>
              <dd className="text-neutral-900">{caseData.firNumber}</dd>
              {caseData.firDate && (
                <>
                  <dt><Bi en="FIR date" hi="प्राथमिकी दिनांक" /></dt>
                  <dd className="text-neutral-900">{formatDateOnly(new Date(caseData.firDate))}</dd>
                </>
              )}
              <dt><Bi en="Police Station" hi="थाना" /></dt>
              <dd className="text-neutral-900">{caseData.policeStation}</dd>
              <dt><Bi en="District/UT" hi="जिला" /></dt>
              <dd className="text-neutral-900">{caseData.district}</dd>
              {caseData.offenceSections && (
                <>
                  <dt><Bi en="Sections of law" hi="विधि की धाराएँ" /></dt>
                  <dd className="text-neutral-900">{caseData.offenceSections}</dd>
                </>
              )}
              {caseData.courtJurisdiction && (
                <>
                  <dt><Bi en="Court jurisdiction" hi="न्यायालय क्षेत्राधिकार" /></dt>
                  <dd className="text-neutral-900">{caseData.courtJurisdiction}</dd>
                </>
              )}
              {caseData.gdEntryNumber && (
                <>
                  <dt><Bi en="GD/Roznamcha entry no." hi="जीडी/रोज़नामचा प्रविष्टि संख्या" /></dt>
                  <dd className="text-neutral-900">{caseData.gdEntryNumber}</dd>
                </>
              )}
              <dt><Bi en="Complainant" hi="परिवादी" /></dt>
              <dd className="text-neutral-900">
                {caseData.complainantName ?? "not recorded"}
                {caseData.complainantContact ? ` (${caseData.complainantContact})` : ""}
              </dd>
              <dt><Bi en="Accused" hi="अभियुक्त" /></dt>
              <dd className="text-neutral-900">{caseData.accusedDetails ?? "not recorded"}</dd>
              <dt><Bi en="Investigating Officer" hi="अन्वेषण अधिकारी" /></dt>
              <dd className="text-neutral-900">
                {caseData.investigator.name}
                {caseData.investigatorRank ? `, ${caseData.investigatorRank}` : ""}
                {caseData.investigatorBadgeNo ? ` (${caseData.investigatorBadgeNo})` : ""}
              </dd>
              <dt><Bi en="IO contact" hi="अन्वेषण अधिकारी संपर्क" /></dt>
              <dd className="text-neutral-900">
                {caseData.investigatorMobile ?? "not recorded"}
              </dd>
              <dt><Bi en="Evidence type" hi="साक्ष्य प्रकार" /></dt>
              <dd className="capitalize text-neutral-900">{caseData.evidenceKind}</dd>
              <dt><Bi en="Status" hi="स्थिति" /></dt>
              <dd className="capitalize text-neutral-900">{caseData.status}</dd>
              <dt><Bi en="Opened" hi="प्रारंभ तिथि" /></dt>
              <dd className="text-neutral-900">{formatTimestamp(new Date(caseData.openedAt))}</dd>
            </dl>
          </div>

          {/* Brief facts of the case — narrative, English only per §4 scope decision */}
          {caseData.summary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {summarySection}. <Bi en="Brief facts of the case" hi="मामले के संक्षिप्त तथ्य" />
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">{caseData.summary}</p>
            </div>
          )}

          {/* Executive summary — a top-line verdict count across all
              exhibits, so a reader doesn't have to open every exhibit
              block individually to know the overall picture. */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {executiveSummarySection}. <Bi en="Executive summary" hi="कार्यकारी सारांश" />
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600">
              {caseData.evidence.length} exhibit{caseData.evidence.length === 1 ? "" : "s"} on this case
              {Object.keys(verdictCounts).length > 0 && ": "}
              {Object.entries(verdictCounts)
                .map(([verdict, count]) => `${count} ${verdict === "PENDING" ? "awaiting analysis" : verdict.replace("_", "-").toLowerCase()}`)
                .join(", ")}
              .
            </p>
          </div>

          {/* 4. Exhibit particulars + 5. Technical findings, per evidence item */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {exhibitsSection}. <Bi en={`Exhibit particulars & technical findings (${caseData.evidence.length})`} hi="प्रदर्श विवरण एवं तकनीकी निष्कर्ष" />
            </p>
            <div className="mt-2 flex flex-col gap-3">
              {caseData.evidence.length === 0 && (
                <p className="text-xs text-neutral-500">No evidence on this case.</p>
              )}
              {caseData.evidence.map((ev, i) => {
                const thumbnail = exhibitThumbnail(caseData.id, ev);
                const isSensitive = caseData.sensitivityLevel !== "standard";
                return (
                <div key={ev.id} className="rounded border border-neutral-200 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900">
                      Exhibit {i + 1} — {ev.mimeType}
                    </span>
                    {ev.fusionVerdict ? (
                      <span className="font-mono text-neutral-700">
                        {ev.fusionVerdict.verdict.replace("_", "-")} · {ev.fusionVerdict.confidence}%
                      </span>
                    ) : (
                      <span className="text-neutral-400">Analysis pending</span>
                    )}
                  </div>
                  {isSensitive ? (
                    <div className="mt-2 flex h-20 w-32 items-center justify-center rounded border border-dashed border-amber-300 bg-amber-50 text-center text-[9px] leading-snug text-amber-700">
                      Image redacted in this export
                      <br />
                      ({caseData.sensitivityLevel === "ncii" ? "NCII" : "minor"} sensitivity — view via audited
                      reveal in-platform)
                    </div>
                  ) : (
                    thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element -- authenticated, session-gated API route, not an optimizable static/remote asset
                      <img
                        src={thumbnail.url}
                        alt={`Exhibit ${i + 1} thumbnail`}
                        className="mt-2 h-24 w-auto max-w-[180px] rounded border border-neutral-300 object-contain"
                      />
                    )
                  )}
                  {thumbnail && !isSensitive && (
                    <p className="mt-0.5 text-[10px] text-neutral-400">{thumbnail.caption}</p>
                  )}
                  <p className="mt-1 break-all font-mono text-[10px] text-neutral-500">SHA-256: {ev.sha256}</p>
                  <p className="mt-0.5 text-neutral-500">
                    Device identifier: {ev.deviceIdentifier ?? "not applicable (digital upload, not a seized device)"}
                  </p>
                  {ev.casePropertyNumber && (
                    <p className="mt-0.5 text-neutral-500">Case property no.: {ev.casePropertyNumber}</p>
                  )}
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
                  {ev.fusionVerdict ? (
                    <>
                      <p className="mt-1 text-neutral-600">{ev.fusionVerdict.explanation}</p>
                      <p className="mt-1 text-neutral-500">
                        Signals corroborating: {ev.fusionVerdict.coverageCount}/3 (
                        {(() => {
                          try {
                            const breakdown: Record<string, string> = JSON.parse(ev.fusionVerdict.signalBreakdownJson);
                            return Object.entries(breakdown)
                              .map(([k, v]) => `${signalLabel(k)}: ${v}`)
                              .join("; ");
                          } catch {
                            return "breakdown unavailable";
                          }
                        })()}
                        )
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-neutral-500">Detection/fusion not yet run on this exhibit.</p>
                  )}
                  <p className="mt-1 text-neutral-400">
                    OSINT reverse-search: not run — not yet an implemented capability of this build.
                  </p>
                  <p className="text-neutral-400">
                    Propagation/spread mapping: not applicable — no seeded corpus data for this case.
                  </p>
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
                );
              })}
            </div>
          </div>

          {/* 6. Chain of custody — physical transfers (a real seizure/
              handover/witness record) shown first and separately from the
              system access log below, since a court's idea of "chain of
              custody" for a seized exhibit is not "who logged in." */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {custodySection}. <Bi en="Chain of custody" hi="अभिरक्षा श्रृंखला" />
            </p>

            {caseData.evidence.some((ev) => ev.custodyTransfers.length > 0) ? (
              <div className="mt-1.5 flex flex-col gap-3">
                {caseData.evidence.map(
                  (ev, i) =>
                    ev.custodyTransfers.length > 0 && (
                      <div key={ev.id}>
                        <p className="text-[10px] font-medium uppercase text-neutral-500">Exhibit {i + 1} — physical transfers</p>
                        <table className="mt-1 w-full border-collapse text-xs text-neutral-600">
                          <thead>
                            <tr className="border-b border-neutral-200 text-left text-[10px] uppercase text-neutral-400">
                              <th className="py-1 font-medium">From</th>
                              <th className="py-1 font-medium">To</th>
                              <th className="py-1 font-medium">Purpose</th>
                              <th className="py-1 font-medium">Witnesses</th>
                              <th className="py-1 text-right font-medium">When</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ev.custodyTransfers.map((t) => (
                              <tr key={t.id} className="border-b border-dashed border-neutral-100">
                                <td className="py-1.5">{t.fromPerson}</td>
                                <td className="py-1.5">{t.toPerson}</td>
                                <td className="py-1.5">{t.purpose}{t.location ? ` (${t.location})` : ""}</td>
                                <td className="py-1.5">
                                  {[t.witness1Name, t.witness2Name].filter(Boolean).join("; ") || "none recorded"}
                                </td>
                                <td className="py-1.5 text-right font-mono text-[10px] text-neutral-400">
                                  {formatTimestamp(new Date(t.occurredAt))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ),
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-[10px] text-neutral-400">
                No physical custody transfers recorded — every exhibit on this case is a direct digital upload,
                not a seized device requiring seizure/handover records.
              </p>
            )}

            <p className="mb-1 mt-3 text-[10px] font-medium uppercase text-neutral-500">System audit trail</p>
            <table className="w-full border-collapse text-xs text-neutral-600">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-[10px] uppercase text-neutral-400">
                  <th className="py-1 font-medium"><Bi en="Timestamp" hi="समय" /></th>
                  <th className="py-1 font-medium"><Bi en="Actor" hi="कर्ता" /></th>
                  <th className="py-1 font-medium"><Bi en="Action" hi="कार्रवाई" /></th>
                  <th className="py-1 text-right font-medium"><Bi en="Device" hi="उपकरण" /></th>
                </tr>
              </thead>
              <tbody>
                {auditLog.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-1.5 text-neutral-400">No audit entries.</td>
                  </tr>
                )}
                {auditLog.map((a) => (
                  <tr key={a.id} className="border-b border-dashed border-neutral-100">
                    <td className="py-1.5 font-mono text-neutral-400">{formatTimestamp(new Date(a.timestamp))}</td>
                    <td className="py-1.5">{a.actor?.name ?? "system"}</td>
                    <td className="py-1.5">{a.action.toLowerCase()}</td>
                    <td className="py-1.5 text-right font-mono text-[10px] text-neutral-400">{a.device ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 7. Section 63 BSA certificate — Part A + Part B, per exhibit */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {certificateSection}. <Bi en="Section 63 BSA Certificate" hi="धारा 63 भारतीय साक्ष्य अधिनियम प्रमाणपत्र" />
            </p>
            <p className="mt-1 text-[10px] text-neutral-500">
              <Bi
                en="Under Section 63, Bharatiya Sakshya Adhiniyam, 2023 (replacing Section 65B, Indian Evidence Act 1872, effective 1 July 2024)"
                hi="भारतीय साक्ष्य अधिनियम, 2023 की धारा 63 के अंतर्गत।"
              />
            </p>
            <div className="mt-3 flex flex-col gap-4">
              {caseData.evidence.map((ev, i) => {
                // The declarant should be whoever actually operated/possessed
                // the device that produced this record — not automatically
                // the IO. Falls back to the IO only when no per-exhibit
                // declarant has been recorded (see DeclarantDialog).
                const declarantName = ev.declarantName ?? caseData.investigator.name;
                const declarantRole = ev.declarantRole ?? "Investigating Officer";
                const declarantPosting = ev.declarantOrg ?? `${caseData.policeStation}, ${caseData.district}`;
                return (
                <div key={ev.id} className="rounded border border-neutral-300 p-3 text-xs">
                  <p className="font-medium text-neutral-900">
                    Exhibit {i + 1} — {ev.mimeType} (SHA-256: <span className="font-mono">{ev.sha256.slice(0, 16)}…</span>)
                  </p>

                  <div className="mt-2 border-t border-neutral-200 pt-2">
                    <p className="font-semibold text-neutral-800">
                      <Bi en="Part A — Declaration by person in custody/control of the device" hi="भाग अ — उपकरण की अभिरक्षा/नियंत्रण में व्यक्ति द्वारा घोषणा" />
                    </p>
                    <p className="mt-1.5 text-[10px] italic leading-snug text-neutral-600">
                      <Bi
                        en={`I, ${declarantName}, ${declarantRole}, ${declarantPosting}, do hereby solemnly affirm and state as under:—`}
                        hi={`मैं, ${declarantName}, ${declarantRole}, ${declarantPosting}, एतद्द्वारा गंभीरतापूर्वक घोषणा करता/करती हूँ:—`}
                      />
                    </p>
                    <dl className="mt-1.5 grid grid-cols-2 gap-y-1 text-neutral-600">
                      <dt><Bi en="Declarant" hi="घोषणाकर्ता" /></dt>
                      <dd className="text-neutral-900">
                        {declarantName}, {declarantRole}
                        {!ev.declarantName && !caseData.investigatorRank && " — rank not recorded at case intake"}
                      </dd>
                      <dt><Bi en="Posting / organisation" hi="पदस्थापना / संगठन" /></dt>
                      <dd className="text-neutral-900">{declarantPosting}</dd>
                      <dt><Bi en="Source device type" hi="स्रोत उपकरण प्रकार" /></dt>
                      <dd className="text-neutral-900">
                        {ev.deviceIdentifier ? "Seized device (identifier below)" : "Digital upload via Pramana platform"}
                      </dd>
                      {ev.deviceIdentifier && (
                        <>
                          <dt><Bi en="Device identifier" hi="उपकरण पहचानकर्ता" /></dt>
                          <dd className="font-mono text-neutral-900">{ev.deviceIdentifier}</dd>
                        </>
                      )}
                      {ev.casePropertyNumber && (
                        <>
                          <dt><Bi en="Case property no." hi="केस संपत्ति संख्या" /></dt>
                          <dd className="text-neutral-900">{ev.casePropertyNumber}</dd>
                        </>
                      )}
                      <dt><Bi en="Record hash (SHA-256)" hi="अभिलेख हैश" /></dt>
                      <dd className="break-all font-mono text-[10px] text-neutral-900">{ev.sha256}</dd>
                      <dt><Bi en="Computed at intake" hi="अंतर्ग्रहण के समय" /></dt>
                      <dd className="text-neutral-900">{formatTimestamp(new Date(ev.uploadedAt))}</dd>
                    </dl>
                    {/* The Schedule to Section 63/65B's four conditions,
                        enumerated separately rather than merged into one
                        sentence — courts scrutinize each one individually,
                        and a certificate that doesn't lay them out this way
                        is materially weaker. */}
                    <ol className="mt-2 list-[lower-alpha] space-y-1 pl-4 text-[10px] leading-snug text-neutral-500">
                      <li>
                        <Bi
                          en="The above-described computer/communication device produced the electronic record during a period over which it was regularly used to store or process information for the purposes of the stated activity."
                          hi="उपरोक्त वर्णित कंप्यूटर/संचार उपकरण ने उस अवधि के दौरान इलेक्ट्रॉनिक अभिलेख तैयार किया जिसमें इसका उपयोग नियमित रूप से किया जा रहा था।"
                        />
                      </li>
                      <li>
                        <Bi
                          en="During that period, information of the kind contained in the record was regularly fed into the device in the ordinary course of the said activity."
                          hi="उक्त अवधि के दौरान, अभिलेख में निहित प्रकार की जानकारी उक्त गतिविधि के सामान्य क्रम में नियमित रूप से उपकरण में फीड की गई।"
                        />
                      </li>
                      <li>
                        <Bi
                          en="Throughout the material part of that period, the device was operating properly, or if not, that no such non-operation affected the record or the accuracy of its contents."
                          hi="उक्त अवधि के सुसंगत भाग के दौरान, उपकरण उचित रूप से कार्यरत था, अथवा यदि नहीं, तो इससे अभिलेख या उसकी विषय-वस्तु की सटीकता प्रभावित नहीं हुई।"
                        />
                      </li>
                      <li>
                        <Bi
                          en="The information contained in the record reproduces or is derived from information fed into the device in the ordinary course of the said activity."
                          hi="अभिलेख में निहित जानकारी उक्त गतिविधि के सामान्य क्रम में उपकरण में फीड की गई जानकारी को पुनरुत्पादित करती है अथवा उससे व्युत्पन्न है।"
                        />
                      </li>
                    </ol>
                    <p className="mt-2 border-t border-dashed border-neutral-200 pt-2 text-[10px] leading-snug text-neutral-500">
                      <span className="font-semibold uppercase text-neutral-700">
                        <Bi en="Verification" hi="सत्यापन" />:
                      </span>{" "}
                      <Bi
                        en="Verified that the contents of the above declaration are true and correct to the best of my knowledge and belief, that no part of it is false, and that nothing material has been concealed therefrom."
                        hi="सत्यापित किया जाता है कि उपरोक्त घोषणा की विषय-वस्तु मेरी सर्वोत्तम जानकारी एवं विश्वास के अनुसार सत्य एवं सही है, इसका कोई भाग असत्य नहीं है, तथा इसमें कोई तथ्य छिपाया नहीं गया है।"
                      />
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3 border-t border-dashed border-neutral-200 pt-2 text-[10px] text-neutral-500">
                      <div><Bi en="Signature" hi="हस्ताक्षर" />: ______________</div>
                      <div><Bi en="Name" hi="नाम" />: {declarantName}</div>
                      <div><Bi en="Date" hi="दिनांक" />: ______________</div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-neutral-200 pt-2">
                    <p className="font-semibold text-neutral-800">
                      <Bi en="Part B — Cyber forensic expert authentication" hi="भाग ब — साइबर फोरेंसिक विशेषज्ञ प्रमाणीकरण" />
                    </p>
                    {ev.forensicExpert ? (
                      <dl className="mt-1.5 grid grid-cols-2 gap-y-1 text-neutral-600">
                        <dt><Bi en="Expert" hi="विशेषज्ञ" /></dt>
                        <dd className="text-neutral-900">{ev.forensicExpert.name}, {ev.forensicExpert.designation}</dd>
                        <dt><Bi en="Laboratory reference" hi="प्रयोगशाला संदर्भ" /></dt>
                        <dd className="text-neutral-900">{ev.forensicExpert.labRef}</dd>
                        {ev.courtDirectionRef && (
                          <>
                            <dt><Bi en="Court direction ref." hi="न्यायालय निर्देश संदर्भ" /></dt>
                            <dd className="text-neutral-900">{ev.courtDirectionRef}</dd>
                          </>
                        )}
                      </dl>
                    ) : ev.courtDirectionRef ? (
                      <p className="mt-1 text-neutral-500">
                        <Bi
                          en={`Part B — forwarding in progress. Court has directed independent expert verification (ref: ${ev.courtDirectionRef}); expert findings not yet received.`}
                          hi={`भाग ब — अग्रेषण प्रक्रियाधीन। न्यायालय ने स्वतंत्र विशेषज्ञ सत्यापन का निर्देश दिया है (संदर्भ: ${ev.courtDirectionRef}); विशेषज्ञ के निष्कर्ष अभी प्राप्त नहीं हुए हैं।`}
                        />
                      </p>
                    ) : (
                      <p className="mt-1 text-neutral-500">
                        <Bi
                          en="Part B — not applicable, no court direction for independent expert verification on this evidence."
                          hi="भाग ब — लागू नहीं, इस साक्ष्य पर स्वतंत्र विशेषज्ञ सत्यापन हेतु न्यायालय का कोई निर्देश प्राप्त नहीं हुआ।"
                        />
                      </p>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* 8. Sign-off block */}
          <div className="rounded border border-neutral-300 p-3 text-xs">
            <p className="font-semibold text-neutral-800">
              {signOffSection}. <Bi en="Investigating officer's sign-off" hi="अन्वेषण अधिकारी का प्रमाणन" />
            </p>
            <p className="mt-1 text-[10px] leading-snug text-neutral-500">
              <Bi
                en="I certify that this report accurately reflects the state of the case and evidence as recorded on the Pramana platform at the time of generation."
                hi="मैं प्रमाणित करता/करती हूँ कि यह रिपोर्ट तैयार होने के समय प्रमाण प्लेटफ़ॉर्म पर दर्ज मामले एवं साक्ष्य की स्थिति को सटीक रूप से दर्शाती है।"
              />
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-dashed border-neutral-200 pt-2 text-[10px] text-neutral-500">
              <div><Bi en="Signature" hi="हस्ताक्षर" />: ______________</div>
              <div>
                <Bi en="Name" hi="नाम" />: {caseData.investigator.name}
                {caseData.investigatorRank ? `, ${caseData.investigatorRank}` : ""}
              </div>
              <div><Bi en="Date" hi="दिनांक" />: ______________</div>
            </div>
            <div className="mt-2 flex items-center justify-end">
              <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-neutral-300 text-center text-[9px] text-neutral-400">
                <Bi en="Seal" hi="मुहर" />
              </div>
            </div>
          </div>

          {/* Forwarding / countersigning officer — a report signed only by
              the preparing IO has no record of being forwarded through a
              chain of command, unlike every real report sent to a court.
              Honestly shows "not yet forwarded" rather than a fabricated
              second signature when this hasn't happened yet. */}
          <div className="rounded border border-neutral-300 p-3 text-xs">
            <p className="font-semibold text-neutral-800">
              <Bi en="Forwarding officer's countersignature" hi="अग्रेषण अधिकारी का प्रति-हस्ताक्षर" />
            </p>
            {caseData.forwardingOfficerName ? (
              <>
                <p className="mt-1 text-[10px] leading-snug text-neutral-500">
                  <Bi
                    en={`Forwarded by ${caseData.forwardingOfficerName}, ${caseData.forwardingOfficerRank}${caseData.forwardingOfficerBadgeNo ? ` (${caseData.forwardingOfficerBadgeNo})` : ""} on ${caseData.forwardedAt ? formatDateOnly(new Date(caseData.forwardedAt)) : "—"}.${caseData.forwardingRemarks ? ` Remarks: ${caseData.forwardingRemarks}` : ""}`}
                    hi={`${caseData.forwardingOfficerName}, ${caseData.forwardingOfficerRank} द्वारा अग्रेषित।`}
                  />
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-dashed border-neutral-200 pt-2 text-[10px] text-neutral-500">
                  <div><Bi en="Signature" hi="हस्ताक्षर" />: ______________</div>
                  <div>
                    <Bi en="Name" hi="नाम" />: {caseData.forwardingOfficerName}, {caseData.forwardingOfficerRank}
                  </div>
                  <div><Bi en="Date" hi="दिनांक" />: ______________</div>
                </div>
              </>
            ) : (
              <p className="mt-1 text-[10px] text-neutral-500">
                <Bi
                  en="Not yet forwarded through a superior officer — this report has been signed only by the preparing investigating officer above."
                  hi="अभी तक किसी वरिष्ठ अधिकारी के माध्यम से अग्रेषित नहीं किया गया — यह रिपोर्ट केवल उपरोक्त तैयार करने वाले अन्वेषण अधिकारी द्वारा हस्ताक्षरित है।"
                />
              </p>
            )}
          </div>

          {/* 9. Legal-status footer — mandatory, bilingual */}
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-[11px] leading-snug text-amber-900">
            <p>
              This is a system-generated draft correctly structured to satisfy Section 63, Bharatiya Sakshya
              Adhiniyam, 2023 (BSA) evidentiary requirements. It attains legal validity only once physically or
              digitally signed/executed by the investigating officer and, where applicable, countersigned by the
              certifying forensic expert. The software does not itself certify anything.
            </p>
            <p className="mt-1.5" lang="hi">
              यह एक सिस्टम-जनित प्रारूप है जो धारा 63, भारतीय साक्ष्य अधिनियम, 2023 (BSA) की साक्ष्यिक आवश्यकताओं को
              पूरा करने हेतु संरचित है। यह केवल अन्वेषण अधिकारी द्वारा भौतिक या डिजिटल रूप से हस्ताक्षरित/निष्पादित
              होने, तथा जहाँ लागू हो, प्रमाणकारी फोरेंसिक विशेषज्ञ द्वारा प्रति-हस्ताक्षरित होने पर ही कानूनी वैधता
              प्राप्त करता है। यह सॉफ़्टवेयर स्वयं किसी भी वस्तु को प्रमाणित नहीं करता।
            </p>
            <p className="mt-1.5 text-[10px] text-amber-700">
              Hindi text machine-translated from the platform&apos;s fixed English template, not yet reviewed by a
              native/legal Hindi speaker — verify before evidentiary use, per PS4_MVP_BUILD_PLAN.md §4.
            </p>
          </div>

          {/* Distribution list — standard "Copy to" convention on Indian
              government/departmental correspondence, kept generic (case
              record + reporting chain only) rather than inventing named
              recipients this platform has no real record of. */}
          <div className="border-t border-neutral-200 pt-3 text-[10px] leading-relaxed text-neutral-500">
            <p className="font-semibold uppercase tracking-wide text-neutral-600">
              <Bi en="Copy to" hi="प्रतिलिपि प्रेषित" />:
            </p>
            <ol className="mt-1 list-decimal pl-4">
              <li>
                <Bi en="Case diary / record, for retention" hi="केस डायरी / अभिलेख, संधारण हेतु" />
              </li>
              <li>
                <Bi
                  en={`Reporting officer's supervisory channel, ${caseData.policeStation}`}
                  hi={`रिपोर्टिंग अधिकारी की पर्यवेक्षी शृंखला, ${caseData.policeStation}`}
                />
              </li>
            </ol>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t-2 border-neutral-800 px-8 py-4 text-[10px] text-neutral-500">
          {/* eslint-disable-next-line @next/next/no-img-element -- server-generated data: URI, not an optimizable remote/static asset */}
          <img
            src={qrDataUrl}
            alt="Report verification QR — encodes case ID and integrity hash"
            className="size-14 shrink-0 border border-neutral-200"
          />
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span>Signed off by {caseData.investigator.name}</span>
              <span className="flex items-center gap-1">
                <Download className="size-3" /> Chandigarh Police — Pramana Forensic Evidence Platform
              </span>
            </div>
            <p className="break-all font-mono text-neutral-400">
              Report integrity hash (SHA-256, over case/exhibit/audit-chain content — recompute via report.json to
              verify this copy matches the platform&apos;s current record): {integrityHash}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
