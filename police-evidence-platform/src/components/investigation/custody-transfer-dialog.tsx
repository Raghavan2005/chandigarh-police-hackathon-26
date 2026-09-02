"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardList, Loader2 } from "lucide-react";
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

/**
 * Logs a real physical chain-of-custody entry (seizure / handover /
 * storage transfer) for an exhibit — distinct from the system audit log,
 * which only records logins/clicks, not who physically held an exhibit
 * and which independent witnesses were present. See CustodyTransfer in
 * schema.prisma.
 */
export function CustodyTransferDialog({ caseId, evidenceId }: { caseId: string; evidenceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fromPerson, setFromPerson] = useState("");
  const [toPerson, setToPerson] = useState("");
  const [purpose, setPurpose] = useState("");
  const [location, setLocation] = useState("");
  const [witness1Name, setWitness1Name] = useState("");
  const [witness2Name, setWitness2Name] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!fromPerson.trim() || !toPerson.trim() || !purpose.trim()) {
      setStatus("error");
      setErrorMessage("From, To, and Purpose are all required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/custody`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromPerson: fromPerson.trim(),
        toPerson: toPerson.trim(),
        purpose: purpose.trim(),
        location: location.trim() || undefined,
        witness1Name: witness1Name.trim() || undefined,
        witness2Name: witness2Name.trim() || undefined,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not log the custody transfer — check your connection and try again.");
      return;
    }

    setStatus("idle");
    setOpen(false);
    setFromPerson("");
    setToPerson("");
    setPurpose("");
    setLocation("");
    setWitness1Name("");
    setWitness2Name("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "xs" }), "text-text-tertiary hover:text-text-primary")}
      >
        <ClipboardList className="size-3.5" />
        Log custody transfer
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Log a chain-of-custody transfer</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Record a real seizure, handover, or storage transfer of this exhibit — separate from the system
            access log below, which only records who logged in and clicked what, not physical custody.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custody-from" className="text-text-secondary">
                Received from
              </Label>
              <Input id="custody-from" value={fromPerson} onChange={(e) => setFromPerson(e.target.value)} placeholder="e.g. Complainant" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custody-to" className="text-text-secondary">
                Handed to
              </Label>
              <Input id="custody-to" value={toPerson} onChange={(e) => setToPerson(e.target.value)} placeholder="e.g. IO, Cyber Cell" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custody-purpose" className="text-text-secondary">
              Purpose
            </Label>
            <Input
              id="custody-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Seizure at complaint intake"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custody-location" className="text-text-secondary">
              Location <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <Input id="custody-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Cyber Crime Cell, Chandigarh" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custody-w1" className="text-text-secondary">
                Witness 1 <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <Input id="custody-w1" value={witness1Name} onChange={(e) => setWitness1Name(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custody-w2" className="text-text-secondary">
                Witness 2 <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <Input id="custody-w2" value={witness2Name} onChange={(e) => setWitness2Name(e.target.value)} />
            </div>
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
