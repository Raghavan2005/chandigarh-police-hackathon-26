"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Download, FileJson, Loader2, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
export function RealReportPreview({ caseData, auditLog }: { caseData: RealCase; auditLog: AuditEntries }) {
  const generatedAt = new Date();
  const [pdfStatus, setPdfStatus] = useState<"idle" | "rendering" | "error">("idle");
  const [pdfError, setPdfError] = useState("");

  // Fetches from GET /api/cases/:id/report.json — the single source of
  // truth for the export payload (PS4_MVP_BUILD_PLAN.md §5) — instead of
  // re-building the same shape client-side, and writes a real EXPORTED
  // audit entry as a side effect (closes the "Audit log wired to every
  // real action" gap: export previously had no server round-trip at all).
  const downloadJson = async () => {
    const response = await fetch(`/api/cases/${caseData.id}/report.json`).catch(() => null);
    if (!response || !response.ok) return;
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseData.id}-evidence-report.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-text-secondary">
          Real case data, structured as a Section 63 BSA evidentiary certificate draft. Human signature required
          before evidentiary use — see the legal-status footer below.
        </p>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-2">
            <button onClick={downloadJson} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <FileJson className="size-4" />
              Export JSON
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
          {pdfStatus === "error" && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {pdfError}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[820px] rounded-md bg-white text-neutral-900 shadow-2xl print:shadow-none">
        {/* 1. Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center gap-3">
            <Image src="/Chandigarh_Police_Logo.png" alt="Chandigarh Police" width={40} height={40} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <Bi en="Chandigarh Police — Pramana Forensic Evidence Platform" hi="चंडीगढ़ पुलिस — प्रमाण फोरेंसिक साक्ष्य प्लेटफ़ॉर्म" />
              </p>
              <h2 className="text-lg font-semibold">
                <Bi en="Investigation Report" hi="अन्वेषण रिपोर्ट" />
              </h2>
            </div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <p>Case {caseData.id}</p>
            <p>Generated {generatedAt.toISOString().slice(0, 10)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          {/* 2. Case & IO particulars */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              <Bi en="Case & investigating officer particulars" hi="मामला एवं अन्वेषण अधिकारी विवरण" />
            </p>
            <p className="mt-1 text-sm font-medium">{caseData.title}</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-neutral-600">
              <dt><Bi en="FIR No." hi="प्राथमिकी संख्या" /></dt>
              <dd className="text-neutral-900">{caseData.firNumber}</dd>
              <dt><Bi en="Police Station" hi="थाना" /></dt>
              <dd className="text-neutral-900">{caseData.policeStation}</dd>
              <dt><Bi en="District/UT" hi="जिला" /></dt>
              <dd className="text-neutral-900">{caseData.district}</dd>
              <dt><Bi en="Investigating Officer" hi="अन्वेषण अधिकारी" /></dt>
              <dd className="text-neutral-900">
                {caseData.investigator.name}
                {caseData.investigatorRank ? `, ${caseData.investigatorRank}` : ""}
                {caseData.investigatorBadgeNo ? ` (${caseData.investigatorBadgeNo})` : ""}
              </dd>
              <dt><Bi en="Evidence type" hi="साक्ष्य प्रकार" /></dt>
              <dd className="capitalize text-neutral-900">{caseData.evidenceKind}</dd>
              <dt><Bi en="Status" hi="स्थिति" /></dt>
              <dd className="capitalize text-neutral-900">{caseData.status}</dd>
              <dt><Bi en="Opened" hi="प्रारंभ तिथि" /></dt>
              <dd className="text-neutral-900">{new Date(caseData.openedAt).toLocaleString()}</dd>
            </dl>
          </div>

          {/* 3. Case summary — narrative, English only per §4 scope decision */}
          {caseData.summary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Case summary</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">{caseData.summary}</p>
            </div>
          )}

          {/* 4. Exhibit particulars + 5. Technical findings, per evidence item */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              <Bi en={`Exhibit particulars & technical findings (${caseData.evidence.length})`} hi="प्रदर्श विवरण एवं तकनीकी निष्कर्ष" />
            </p>
            <div className="mt-2 flex flex-col gap-3">
              {caseData.evidence.length === 0 && (
                <p className="text-xs text-neutral-500">No evidence on this case.</p>
              )}
              {caseData.evidence.map((ev, i) => (
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
                  <p className="mt-1 break-all font-mono text-[10px] text-neutral-500">SHA-256: {ev.sha256}</p>
                  <p className="mt-0.5 text-neutral-500">
                    Device identifier: {ev.deviceIdentifier ?? "not applicable (digital upload, not a seized device)"}
                  </p>
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
              ))}
            </div>
          </div>

          {/* 6. Chain of custody */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              <Bi en="Chain of custody" hi="अभिरक्षा श्रृंखला" />
            </p>
            <table className="mt-1.5 w-full border-collapse text-xs text-neutral-600">
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
                    <td className="py-1.5 font-mono text-neutral-400">{new Date(a.timestamp).toLocaleString()}</td>
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
              <Bi en="Section 63 BSA Certificate" hi="धारा 63 भारतीय साक्ष्य अधिनियम प्रमाणपत्र" />
            </p>
            <p className="mt-1 text-[10px] text-neutral-500">
              <Bi
                en="Under Section 63, Bharatiya Sakshya Adhiniyam, 2023 (replacing Section 65B, Indian Evidence Act 1872, effective 1 July 2024)"
                hi="भारतीय साक्ष्य अधिनियम, 2023 की धारा 63 के अंतर्गत।"
              />
            </p>
            <div className="mt-3 flex flex-col gap-4">
              {caseData.evidence.map((ev, i) => (
                <div key={ev.id} className="rounded border border-neutral-300 p-3 text-xs">
                  <p className="font-medium text-neutral-900">
                    Exhibit {i + 1} — {ev.mimeType} (SHA-256: <span className="font-mono">{ev.sha256.slice(0, 16)}…</span>)
                  </p>

                  <div className="mt-2 border-t border-neutral-200 pt-2">
                    <p className="font-semibold text-neutral-800">
                      <Bi en="Part A — Declaration by person in custody/control of the device" hi="भाग अ — उपकरण की अभिरक्षा/नियंत्रण में व्यक्ति द्वारा घोषणा" />
                    </p>
                    <dl className="mt-1.5 grid grid-cols-2 gap-y-1 text-neutral-600">
                      <dt><Bi en="Declarant" hi="घोषणाकर्ता" /></dt>
                      <dd className="text-neutral-900">
                        {caseData.investigator.name}
                        {caseData.investigatorRank ? `, ${caseData.investigatorRank}` : " — rank not recorded at case intake"}
                        {caseData.investigatorBadgeNo ? ` (${caseData.investigatorBadgeNo})` : ""}
                      </dd>
                      <dt><Bi en="Posting" hi="पदस्थापना" /></dt>
                      <dd className="text-neutral-900">{caseData.policeStation}, {caseData.district}</dd>
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
                      <dt><Bi en="Record hash (SHA-256)" hi="अभिलेख हैश" /></dt>
                      <dd className="break-all font-mono text-[10px] text-neutral-900">{ev.sha256}</dd>
                      <dt><Bi en="Computed at intake" hi="अंतर्ग्रहण के समय" /></dt>
                      <dd className="text-neutral-900">{new Date(ev.uploadedAt).toLocaleString()}</dd>
                    </dl>
                    <p className="mt-2 text-[10px] leading-snug text-neutral-500">
                      <Bi
                        en="I declare that the above-described computer/communication device was regularly used to store or process the said record in the ordinary course of the stated activity, and that the device was operating properly at the material time."
                        hi="मैं घोषणा करता/करती हूँ कि उपरोक्त वर्णित कंप्यूटर/संचार उपकरण उक्त अभिलेख के भंडारण या संसाधन हेतु संबंधित गतिविधि के सामान्य क्रम में नियमित रूप से उपयोग किया गया, तथा उक्त उपकरण सुसंगत समय पर उचित रूप से कार्यरत था।"
                      />
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3 border-t border-dashed border-neutral-200 pt-2 text-[10px] text-neutral-500">
                      <div><Bi en="Signature" hi="हस्ताक्षर" />: ______________</div>
                      <div><Bi en="Name" hi="नाम" />: {caseData.investigator.name}</div>
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
                      </dl>
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
              ))}
            </div>
          </div>

          {/* 8. Sign-off block */}
          <div className="rounded border border-neutral-300 p-3 text-xs">
            <p className="font-semibold text-neutral-800">
              <Bi en="Investigating officer's sign-off" hi="अन्वेषण अधिकारी का प्रमाणन" />
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
