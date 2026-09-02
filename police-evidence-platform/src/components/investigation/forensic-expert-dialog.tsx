"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Microscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ForensicExpert {
  name: string;
  designation: string;
  labRef: string;
}

/**
 * Records a real Part B — Cyber forensic expert authentication
 * (PS4_MVP_BUILD_PLAN.md §4) once a court has directed independent
 * verification. Until this exists for an exhibit, the report correctly
 * shows "Part B — not applicable" rather than fabricating expert content
 * for every case — this dialog is what makes that section reachable for
 * real, not permanently dead.
 *
 * Also records `courtDirectionRef` on its own — a real middle state
 * between "not applicable" and "expert findings recorded": a court has
 * directed examination but the expert's report hasn't come back yet.
 * Fill that in alone first; add the full expert details once they arrive.
 */
export function ForensicExpertDialog({
  caseId,
  evidenceId,
  existing,
  existingCourtDirectionRef,
}: {
  caseId: string;
  evidenceId: string;
  existing: ForensicExpert | null;
  existingCourtDirectionRef?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.name ?? "");
  const [designation, setDesignation] = useState(existing?.designation ?? "");
  const [labRef, setLabRef] = useState(existing?.labRef ?? "");
  const [courtDirectionRef, setCourtDirectionRef] = useState(existingCourtDirectionRef ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    const hasExpertDetails = name.trim() || designation.trim() || labRef.trim();
    if (hasExpertDetails && (!name.trim() || !designation.trim() || !labRef.trim())) {
      setStatus("error");
      setErrorMessage("If recording expert details, name, designation, and laboratory reference are all required.");
      return;
    }
    if (!hasExpertDetails && !courtDirectionRef.trim()) {
      setStatus("error");
      setErrorMessage("Provide either a court direction reference or full expert details.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/forensic-expert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || undefined,
        designation: designation.trim() || undefined,
        labRef: labRef.trim() || undefined,
        courtDirectionRef: courtDirectionRef.trim() || undefined,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not save the forensic expert record — check your connection and try again.");
      return;
    }

    setStatus("idle");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "xs" }), "text-text-tertiary hover:text-text-primary")}
      >
        <Microscope className="size-3.5" />
        {existing ? "Edit Part B expert" : existingCourtDirectionRef ? "Edit Part B (awaiting expert)" : "Record Part B expert"}
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Section 63 BSA — Part B: forensic expert</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Only fill this in when a court has actually directed independent expert verification of this
            exhibit. Fill in just the court direction reference first if the expert&apos;s report hasn&apos;t
            arrived yet — that shows an honest &quot;forwarding in progress&quot; state instead of either
            fabricating findings or leaving the report saying &quot;not applicable&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expert-direction-ref" className="text-text-secondary">
              Court direction reference <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <Input
              id="expert-direction-ref"
              value={courtDirectionRef}
              onChange={(e) => setCourtDirectionRef(e.target.value)}
              placeholder="e.g. Order dated 12.09.2026, CJM Chandigarh, Crl. MA No. 231/2026"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expert-name" className="text-text-secondary">
              Expert full name <span className="font-normal text-text-tertiary">(once findings arrive)</span>
            </Label>
            <Input id="expert-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. A. Mehta" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expert-designation" className="text-text-secondary">
              Designation
            </Label>
            <Input
              id="expert-designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Scientific Officer, CFSL Chandigarh"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expert-labref" className="text-text-secondary">
              Laboratory reference
            </Label>
            <Input
              id="expert-labref"
              value={labRef}
              onChange={(e) => setLabRef(e.target.value)}
              placeholder="e.g. CFSL/2026/CYB/0231"
            />
          </div>
        </div>
        {status === "error" && (
          <p role="alert" className="flex items-center gap-1.5 text-xs text-status-critical">
            <AlertTriangle className="size-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}
        <DialogFooter>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={status === "submitting"}
            className="bg-accent-primary text-white hover:bg-accent-primary-hover"
          >
            {status === "submitting" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
