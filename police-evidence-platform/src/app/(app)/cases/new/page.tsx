"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepperHeader } from "@/components/upload/stepper-header";
import { MultiFileDropzone, classifyFiles, type QueuedFile } from "@/components/upload/multi-file-dropzone";
import { formatBytes } from "@/components/upload/upload-dropzone";
import { TabletCaptureHint } from "@/components/upload/tablet-capture-hint";
import { buttonVariants } from "@/components/ui/button";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";

const DEMO_IMAGE_URL = "/evidence/case-image-evidence.jpg";

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [firNumber, setFirNumber] = useState("");
  const [firDate, setFirDate] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [district, setDistrict] = useState("Chandigarh (UT)");
  const [investigatorRank, setInvestigatorRank] = useState("");
  const [investigatorBadgeNo, setInvestigatorBadgeNo] = useState("");
  const [investigatorMobile, setInvestigatorMobile] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sensitivityLevel, setSensitivityLevel] = useState<"standard" | "ncii" | "minor">("standard");
  const [offenceSections, setOffenceSections] = useState("");
  const [complainantName, setComplainantName] = useState("");
  const [complainantContact, setComplainantContact] = useState("");
  const [accusedDetails, setAccusedDetails] = useState("");
  const [courtJurisdiction, setCourtJurisdiction] = useState("");
  const [gdEntryNumber, setGdEntryNumber] = useState("");
  const [dispatchNumber, setDispatchNumber] = useState("");

  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);
  const [deviceIdentifier, setDeviceIdentifier] = useState("");
  const [casePropertyNumber, setCasePropertyNumber] = useState("");

  function addFiles(files: File[]) {
    const { queued, rejected } = classifyFiles(files);
    setQueuedFiles((prev) => [...prev, ...queued]);
    setRejectedNames(rejected.map((f) => f.name));
  }

  function removeFile(id: string) {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const [demoFillStatus, setDemoFillStatus] = useState<"idle" | "loading">("idle");

  // Populates the wizard with a plausible sample case for demoing the
  // pipeline end to end — pulls a real image from public/evidence rather
  // than a 1x1 placeholder so the file actually clears image-kind
  // validation and produces a real detection result downstream.
  async function fillDemoData() {
    setFirNumber("0231/2026");
    setFirDate("2026-09-05");
    setPoliceStation("Cyber Crime Cell, Chandigarh");
    setDistrict("Chandigarh (UT)");
    setOffenceSections("BNS 336, IT Act 66C/66D/66E/67A");
    setCourtJurisdiction("Court of the CJM, Chandigarh");
    setComplainantName("Rajesh Kumar");
    setComplainantContact("98765xxxxx");
    setAccusedDetails("Unidentified");
    setGdEntryNumber("GD No. 14 dated 05-09-2026");
    setDispatchNumber("DAK/2026/0417");
    setInvestigatorRank("Sub-Inspector");
    setInvestigatorBadgeNo("PIS-04471");
    setInvestigatorMobile("9876543210");
    setTitle("Viral clip allegedly showing public official — authenticity disputed");
    setSummary(
      "Complainant reported a widely circulated video clip that appears to show a public official making inflammatory remarks. The clip's origin is unclear and playback shows possible signs of tampering. Forensic examination requested to establish authenticity and trace the earliest point of upload.",
    );
    setSensitivityLevel("standard");

    if (queuedFiles.length === 0) {
      setDemoFillStatus("loading");
      const response = await fetch(DEMO_IMAGE_URL).catch(() => null);
      if (response?.ok) {
        const blob = await response.blob();
        addFiles([new File([blob], "demo-evidence.jpg", { type: blob.type || "image/jpeg" })]);
      }
      setDemoFillStatus("idle");
    }
  }

  const [investigatorName, setInvestigatorName] = useState<string | null>(null);
  const [investigatorNameStatus, setInvestigatorNameStatus] = useState<"loading" | "loaded" | "error">("loading");

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  // Set once the case row itself is successfully created — if only the
  // evidence upload leg then fails, retrying must resume from here instead
  // of calling POST /api/cases again, which has no dedup and would create a
  // second case with the same FIR number every time the investigator
  // retries a transient upload failure.
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setInvestigatorName(d.name ?? null);
        setInvestigatorNameStatus("loaded");
      })
      .catch(() => setInvestigatorNameStatus("error"));
  }, []);

  const canNext =
    (step === 0 && firNumber.trim().length > 0 && policeStation.trim().length > 0 && title.trim().length > 0) ||
    (step === 1 && queuedFiles.length > 0) ||
    step === 2;

  async function handleSubmit() {
    if (queuedFiles.length === 0) return;
    setStatus("submitting");
    setErrorMessage("");

    // If a prior attempt already created the case and only some evidence
    // uploads failed, resume from there instead of creating a second case —
    // POST /api/cases has no dedup on FIR number, so calling it again on
    // every retry would silently pile up duplicate cases.
    let caseId = createdCaseId;
    if (!caseId) {
      const caseResponse = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firNumber,
          policeStation,
          district,
          title,
          summary: summary.trim() || undefined,
          // Display-level only (Case.evidenceKind) — real per-exhibit kind
          // is each Evidence row's own mimeType. First queued file just
          // gives the case a sensible default icon/label.
          evidenceKind: queuedFiles[0].kind,
          sensitivityLevel,
          investigatorRank: investigatorRank.trim() || undefined,
          investigatorBadgeNo: investigatorBadgeNo.trim() || undefined,
          investigatorMobile: investigatorMobile.trim() || undefined,
          offenceSections: offenceSections.trim() || undefined,
          firDate: firDate || undefined,
          complainantName: complainantName.trim() || undefined,
          complainantContact: complainantContact.trim() || undefined,
          accusedDetails: accusedDetails.trim() || undefined,
          courtJurisdiction: courtJurisdiction.trim() || undefined,
          gdEntryNumber: gdEntryNumber.trim() || undefined,
          dispatchNumber: dispatchNumber.trim() || undefined,
        }),
      }).catch(() => null);

      if (!caseResponse || !caseResponse.ok) {
        const body = await caseResponse?.json().catch(() => null);
        setStatus("error");
        setErrorMessage(body?.error ?? "Could not create the case. Check your connection and try again.");
        return;
      }

      const createdCase = await caseResponse.json();
      caseId = createdCase.id;
      setCreatedCaseId(caseId);
    }

    // Sequential, not parallel — keeps per-file progress legible and avoids
    // hammering the server with N concurrent uploads for a large batch.
    // Uploads every file not already marked "done" from a prior attempt, so
    // retrying after a partial failure only re-attempts what actually
    // failed. Tracked in a local variable (not read back from React state)
    // so the pass/fail tally below can't be thrown off by state updates not
    // having flushed between awaits.
    let working = queuedFiles;
    let failedCount = 0;
    let attemptedCount = 0;
    for (const qf of queuedFiles) {
      if (qf.status === "done") continue;
      attemptedCount += 1;
      working = working.map((f) => (f.id === qf.id ? { ...f, status: "uploading" as const } : f));
      setQueuedFiles(working);

      const formData = new FormData();
      formData.append("file", qf.file);
      if (deviceIdentifier.trim()) formData.append("deviceIdentifier", deviceIdentifier.trim());
      if (casePropertyNumber.trim()) formData.append("casePropertyNumber", casePropertyNumber.trim());

      const evidenceResponse = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        body: formData,
      }).catch(() => null);

      if (!evidenceResponse || !evidenceResponse.ok) {
        const body = await evidenceResponse?.json().catch(() => null);
        failedCount += 1;
        working = working.map((f) =>
          f.id === qf.id ? { ...f, status: "error" as const, error: body?.error ?? "Upload failed." } : f,
        );
      } else {
        working = working.map((f) => (f.id === qf.id ? { ...f, status: "done" as const, error: undefined } : f));
      }
      setQueuedFiles(working);
    }

    if (failedCount > 0) {
      setStatus("error");
      setErrorMessage(
        `${failedCount} of ${attemptedCount} file${attemptedCount === 1 ? "" : "s"} failed to upload — see details below, then retry.`,
      );
      return;
    }

    router.push(`/cases/${caseId}`);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">New Case</h1>
          <p className="text-sm text-text-tertiary">
            Create a case and submit evidence for AI-assisted forensic analysis.
          </p>
        </div>
        <button
          type="button"
          onClick={fillDemoData}
          disabled={demoFillStatus === "loading" || status === "submitting"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          {demoFillStatus === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Fill demo content
        </button>
      </div>

      <StepperHeader step={step} />

      <Card className="border-border-subtle bg-surface p-6 shadow-none">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firNumber" className="text-text-secondary">
                  FIR number
                </Label>
                <Input
                  id="firNumber"
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  placeholder="e.g. FIR No. 0231/2026"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firDate" className="text-text-secondary">
                  FIR registration date <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input id="firDate" type="date" value={firDate} onChange={(e) => setFirDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="policeStation" className="text-text-secondary">
                  Police station
                </Label>
                <Input
                  id="policeStation"
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  placeholder="e.g. Cyber Crime Cell, Chandigarh"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="district" className="text-text-secondary">
                  District / UT
                </Label>
                <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="offenceSections" className="text-text-secondary">
                Sections of law <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <Input
                id="offenceSections"
                value={offenceSections}
                onChange={(e) => setOffenceSections(e.target.value)}
                placeholder="e.g. BNS 336, IT Act 66C/66D/66E/67A"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="courtJurisdiction" className="text-text-secondary">
                Court jurisdiction <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <Input
                id="courtJurisdiction"
                value={courtJurisdiction}
                onChange={(e) => setCourtJurisdiction(e.target.value)}
                placeholder="e.g. Court of the CJM, Chandigarh"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="complainantName" className="text-text-secondary">
                  Complainant name <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input
                  id="complainantName"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="complainantContact" className="text-text-secondary">
                  Complainant contact <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input
                  id="complainantContact"
                  value={complainantContact}
                  onChange={(e) => setComplainantContact(e.target.value)}
                  placeholder="Phone / email"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accusedDetails" className="text-text-secondary">
                Accused particulars <span className="font-normal text-text-tertiary">(optional — &quot;unidentified&quot; is valid)</span>
              </Label>
              <Input
                id="accusedDetails"
                value={accusedDetails}
                onChange={(e) => setAccusedDetails(e.target.value)}
                placeholder="e.g. Unidentified; or name/alias if known"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gdEntryNumber" className="text-text-secondary">
                  GD / Roznamcha entry no. <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input id="gdEntryNumber" value={gdEntryNumber} onChange={(e) => setGdEntryNumber(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dispatchNumber" className="text-text-secondary">
                  Dispatch / DAK no. <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input
                  id="dispatchNumber"
                  value={dispatchNumber}
                  onChange={(e) => setDispatchNumber(e.target.value)}
                  placeholder="Assigned by office outward register, if any"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="investigatorRank" className="text-text-secondary">
                  Your rank <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input
                  id="investigatorRank"
                  value={investigatorRank}
                  onChange={(e) => setInvestigatorRank(e.target.value)}
                  placeholder="e.g. Sub-Inspector"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="investigatorBadgeNo" className="text-text-secondary">
                  Badge / PIS no. <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input
                  id="investigatorBadgeNo"
                  value={investigatorBadgeNo}
                  onChange={(e) => setInvestigatorBadgeNo(e.target.value)}
                  placeholder="e.g. PIS-04471"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="investigatorMobile" className="text-text-secondary">
                  Mobile <span className="font-normal text-text-tertiary">(optional)</span>
                </Label>
                <Input
                  id="investigatorMobile"
                  value={investigatorMobile}
                  onChange={(e) => setInvestigatorMobile(e.target.value)}
                  placeholder="e.g. 98xxxxxx10"
                />
              </div>
            </div>
            <p className="-mt-3 text-[11px] text-text-tertiary">
              Recorded on the Section 63 BSA certificate as your declarant particulars — leave blank if not
              applicable and it will be shown as unrecorded on the exported report.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title" className="text-text-secondary">
                Case title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Viral video — fabricated public official quote"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="summary" className="text-text-secondary">
                Brief facts of the case <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <textarea
                id="summary"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Gist of the allegation / what's being investigated."
                className="w-full resize-none rounded-lg border border-border-subtle bg-transparent px-2.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-border-strong"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-text-secondary">Content sensitivity</Label>
              <div className="flex gap-2">
                {(["standard", "ncii", "minor"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSensitivityLevel(level)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                      sensitivityLevel === level
                        ? "border-accent-primary bg-accent-dim text-accent-primary"
                        : "border-border-subtle text-text-secondary hover:border-border-strong",
                    )}
                  >
                    {level === "ncii" ? "NCII" : level}
                  </button>
                ))}
              </div>
              {sensitivityLevel !== "standard" && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-status-warning">
                  <AlertTriangle className="size-3.5" />
                  Evidence will be blurred by default in case lists until explicitly opened.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-sm font-medium text-text-secondary">
                Evidence {queuedFiles.length > 0 && `(${queuedFiles.length})`}
              </p>
              <MultiFileDropzone
                queued={queuedFiles}
                onAdd={addFiles}
                onRemove={removeFile}
                disabled={status === "submitting"}
              />
              {rejectedNames.length > 0 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-status-warning">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  Skipped {rejectedNames.length === 1 ? rejectedNames[0] : `${rejectedNames.length} files`} —
                  unsupported file type.
                </p>
              )}
            </div>
            <TabletCaptureHint onCaptured={(captured) => addFiles([captured])} />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deviceIdentifier" className="text-text-secondary">
                  Device identifier <span className="font-normal text-text-tertiary">(only if seized, optional)</span>
                </Label>
                <Input
                  id="deviceIdentifier"
                  value={deviceIdentifier}
                  onChange={(e) => setDeviceIdentifier(e.target.value)}
                  placeholder="IMEI / MAC / serial"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="casePropertyNumber" className="text-text-secondary">
                  Case property no. <span className="font-normal text-text-tertiary">(Malkhana, optional)</span>
                </Label>
                <Input
                  id="casePropertyNumber"
                  value={casePropertyNumber}
                  onChange={(e) => setCasePropertyNumber(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-status-safe/30 bg-status-safe-bg px-3 py-2 text-status-safe">
              <ShieldCheck className="size-4" />
              <p className="text-sm">
                Ready to submit. This creates the case record and uploads each queued exhibit for real.
                Detection doesn&apos;t run automatically — open the case afterward and click Investigate
                on each exhibit to run the real analysis pipeline.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-text-tertiary">FIR number</dt>
              <dd className="text-text-primary">{firNumber}</dd>
              <dt className="text-text-tertiary">Police station</dt>
              <dd className="text-text-primary">{policeStation}</dd>
              <dt className="text-text-tertiary">Case title</dt>
              <dd className="text-text-primary">{title}</dd>
              <dt className="text-text-tertiary">Exhibits</dt>
              <dd className="text-text-primary">
                <ul className="flex flex-col gap-1">
                  {queuedFiles.map((q) => {
                    const Icon = KIND_ICON[q.kind];
                    return (
                      <li key={q.id} className="flex items-center gap-1.5">
                        <Icon className="size-3.5 shrink-0 text-text-tertiary" />
                        <span className="truncate">{q.file.name}</span>
                        <span className="shrink-0 text-[11px] text-text-tertiary">
                          ({q.kind} · {formatBytes(q.file.size)})
                        </span>
                        {q.status === "done" && <span className="shrink-0 text-[11px] text-status-safe">uploaded</span>}
                        {q.status === "error" && <span className="shrink-0 text-[11px] text-status-critical">failed</span>}
                      </li>
                    );
                  })}
                </ul>
              </dd>
              <dt className="text-text-tertiary">Assigned to</dt>
              <dd className="text-text-primary">
                {investigatorNameStatus === "loading"
                  ? "…"
                  : investigatorNameStatus === "error"
                    ? "Signed-in investigator (name unavailable — check your connection)"
                    : (investigatorName ?? "Signed-in investigator")}{" "}
                (you){investigatorRank ? `, ${investigatorRank}` : ""}
                {investigatorBadgeNo ? ` — ${investigatorBadgeNo}` : ""}
              </dd>
            </dl>
            {status === "error" && (
              <div role="alert" className="flex flex-col gap-1 text-sm text-status-critical">
                <p>{errorMessage}</p>
                {createdCaseId && (
                  <p>
                    The case ({createdCaseId}) was already created — retrying below only re-attempts the upload, it
                    won&apos;t create another case. You can also{" "}
                    <a href={`/cases/${createdCaseId}`} className="underline">
                      open the case now
                    </a>{" "}
                    and upload evidence from there instead.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), step === 0 && "invisible")}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {step < 2 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => Math.min(2, s + 1))}
            className={buttonVariants({
              size: "sm",
              className: "bg-accent-primary text-white hover:bg-accent-primary-hover",
            })}
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={handleSubmit}
            className={buttonVariants({
              size: "sm",
              className: "bg-accent-primary text-white hover:bg-accent-primary-hover",
            })}
          >
            {createdCaseId ? "Retry upload" : "Submit & Investigate"}
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {status === "submitting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-canvas"
          >
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Image src="/Chandigarh_Police_Logo.png" alt="Chandigarh Police" width={72} height={72} />
            </motion.div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 className="size-4 animate-spin text-accent-primary" />
              {createdCaseId
                ? `Uploading exhibits (${queuedFiles.filter((f) => f.status === "done").length}/${queuedFiles.length})…`
                : "Creating case…"}
            </div>
            <p className="text-xs text-text-tertiary">Chandigarh Police — Pramana Forensic Evidence Platform</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
