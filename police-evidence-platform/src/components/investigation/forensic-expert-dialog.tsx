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
 */
export function ForensicExpertDialog({
  caseId,
  evidenceId,
  existing,
}: {
  caseId: string;
  evidenceId: string;
  existing: ForensicExpert | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.name ?? "");
  const [designation, setDesignation] = useState(existing?.designation ?? "");
  const [labRef, setLabRef] = useState(existing?.labRef ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !designation.trim() || !labRef.trim()) {
      setStatus("error");
      setErrorMessage("Expert name, designation, and laboratory reference are all required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/forensic-expert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), designation: designation.trim(), labRef: labRef.trim() }),
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
        {existing ? "Edit Part B expert" : "Record Part B expert"}
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Section 63 BSA — Part B: forensic expert</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Only fill this in when a court has actually directed independent expert verification of this
            exhibit — this replaces the report&apos;s &quot;not applicable&quot; text with the named expert&apos;s
            details. Leave it unset for every other case.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expert-name" className="text-text-secondary">
              Expert full name
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
