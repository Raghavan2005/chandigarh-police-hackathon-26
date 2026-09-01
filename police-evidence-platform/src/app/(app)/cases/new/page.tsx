"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepperHeader } from "@/components/upload/stepper-header";
import { EvidenceTypeTiles } from "@/components/upload/evidence-type-tiles";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { buttonVariants } from "@/components/ui/button";
import type { EvidenceKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [firNumber, setFirNumber] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [district, setDistrict] = useState("Chandigarh (UT)");
  const [investigatorRank, setInvestigatorRank] = useState("");
  const [investigatorBadgeNo, setInvestigatorBadgeNo] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sensitivityLevel, setSensitivityLevel] = useState<"standard" | "ncii" | "minor">("standard");

  const [kind, setKind] = useState<EvidenceKind | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [investigatorName, setInvestigatorName] = useState<string | null>(null);

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setInvestigatorName(d.name ?? null))
      .catch(() => setInvestigatorName(null));
  }, []);

  const canNext =
    (step === 0 && firNumber.trim().length > 0 && policeStation.trim().length > 0 && title.trim().length > 0) ||
    (step === 1 && kind !== null && file !== null) ||
    step === 2;

  async function handleSubmit() {
    if (!kind || !file) return;
    setStatus("submitting");
    setErrorMessage("");

    const caseResponse = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firNumber,
        policeStation,
        district,
        title,
        summary: summary.trim() || undefined,
        evidenceKind: kind,
        sensitivityLevel,
        investigatorRank: investigatorRank.trim() || undefined,
        investigatorBadgeNo: investigatorBadgeNo.trim() || undefined,
      }),
    }).catch(() => null);

    if (!caseResponse || !caseResponse.ok) {
      const body = await caseResponse?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not create the case. Check your connection and try again.");
      return;
    }

    const createdCase = await caseResponse.json();

    const formData = new FormData();
    formData.append("file", file);

    const evidenceResponse = await fetch(`/api/cases/${createdCase.id}/evidence`, {
      method: "POST",
      body: formData,
    }).catch(() => null);

    if (!evidenceResponse || !evidenceResponse.ok) {
      const body = await evidenceResponse?.json().catch(() => null);
      setStatus("error");
      // The case itself was created successfully even though the upload failed —
      // send the investigator there so the case isn't orphaned from view, with
      // an honest message about what actually went wrong.
      setErrorMessage(
        (body?.error ?? "Evidence upload failed.") +
          ` The case (${createdCase.id}) was created — you can retry the upload from its page.`,
      );
      return;
    }

    router.push(`/cases/${createdCase.id}`);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">New Case</h1>
        <p className="text-sm text-text-tertiary">
          Create a case and submit evidence for AI-assisted forensic analysis.
        </p>
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="district" className="text-text-secondary">
                District / UT
              </Label>
              <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                Summary <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <textarea
                id="summary"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief narrative of what's being investigated."
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
              <p className="mb-2 text-sm font-medium text-text-secondary">Evidence type</p>
              <EvidenceTypeTiles value={kind} onChange={setKind} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-text-secondary">Upload file</p>
              <UploadDropzone onComplete={setFile} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-status-safe/30 bg-status-safe-bg px-3 py-2 text-status-safe">
              <ShieldCheck className="size-4" />
              <p className="text-sm">
                Ready to submit. This creates the case record and uploads the evidence file for real.
                Detection doesn&apos;t run automatically — open the case afterward and click Investigate
                to run the real analysis pipeline on this evidence.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-text-tertiary">FIR number</dt>
              <dd className="text-text-primary">{firNumber}</dd>
              <dt className="text-text-tertiary">Police station</dt>
              <dd className="text-text-primary">{policeStation}</dd>
              <dt className="text-text-tertiary">Case title</dt>
              <dd className="text-text-primary">{title}</dd>
              <dt className="text-text-tertiary">Evidence type</dt>
              <dd className="capitalize text-text-primary">{kind}</dd>
              <dt className="text-text-tertiary">File</dt>
              <dd className="truncate text-text-primary">{file?.name}</dd>
              <dt className="text-text-tertiary">Assigned to</dt>
              <dd className="text-text-primary">
                {investigatorName ?? "…"} (you){investigatorRank ? `, ${investigatorRank}` : ""}
                {investigatorBadgeNo ? ` — ${investigatorBadgeNo}` : ""}
              </dd>
            </dl>
            {status === "error" && (
              <p role="alert" className="text-sm text-status-critical">
                {errorMessage}
              </p>
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
            Submit &amp; Investigate
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
              Creating case and uploading evidence…
            </div>
            <p className="text-xs text-text-tertiary">Chandigarh Police — Pramana Forensic Evidence Platform</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
