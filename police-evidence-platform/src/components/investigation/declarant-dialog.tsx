"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, UserCheck } from "lucide-react";
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

interface Declarant {
  declarantName: string | null;
  declarantRole: string | null;
  declarantOrg: string | null;
}

/**
 * Records the real Section 63/65B Part A declarant for an exhibit — the
 * person who was "regularly using the device in the ordinary course of
 * the stated activity." The report previously always assumed this was the
 * investigating officer, which is frequently legally wrong (it's often the
 * complainant, or a platform/service provider's authorized signatory).
 * Leaving this unset keeps the report's previous fallback behavior.
 */
export function DeclarantDialog({
  caseId,
  evidenceId,
  existing,
}: {
  caseId: string;
  evidenceId: string;
  existing: Declarant | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.declarantName ?? "");
  const [role, setRole] = useState(existing?.declarantRole ?? "");
  const [org, setOrg] = useState(existing?.declarantOrg ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !role.trim()) {
      setStatus("error");
      setErrorMessage("Declarant name and role are both required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/declarant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        declarantName: name.trim(),
        declarantRole: role.trim(),
        declarantOrg: org.trim() || undefined,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not save the declarant record — check your connection and try again.");
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
        <UserCheck className="size-3.5" />
        {existing?.declarantName ? "Edit Part A declarant" : "Set Part A declarant"}
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Section 63 BSA — Part A: declarant</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            The declarant should be whoever actually operated/possessed the device that produced this record —
            e.g. the complainant who submitted it, or a platform&apos;s authorized signatory — not automatically
            the investigating officer. Leave unset if the IO genuinely is the device&apos;s custodian (e.g. a
            seized device already in police custody).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="declarant-name" className="text-text-secondary">
              Declarant full name
            </Label>
            <Input id="declarant-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="declarant-role" className="text-text-secondary">
              Role / relationship to the device
            </Label>
            <Input
              id="declarant-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Complainant, Platform representative"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="declarant-org" className="text-text-secondary">
              Organisation <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <Input
              id="declarant-org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g. Meta Platforms Inc. (if a platform representative)"
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
