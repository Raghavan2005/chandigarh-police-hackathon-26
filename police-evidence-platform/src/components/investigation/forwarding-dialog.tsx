"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Stamp } from "lucide-react";
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

interface Forwarding {
  forwardingOfficerName: string | null;
  forwardingOfficerRank: string | null;
  forwardingOfficerBadgeNo: string | null;
  forwardingRemarks: string | null;
}

/**
 * Records a real superior-officer forwarding/countersigning endorsement —
 * every real report sent to a court is forwarded through a chain of
 * command, not signed only by the preparing IO. Case-level (not
 * per-exhibit), matching how a real forwarding endorsement covers the
 * whole report.
 */
export function ForwardingDialog({ caseId, existing }: { caseId: string; existing: Forwarding | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.forwardingOfficerName ?? "");
  const [rank, setRank] = useState(existing?.forwardingOfficerRank ?? "");
  const [badgeNo, setBadgeNo] = useState(existing?.forwardingOfficerBadgeNo ?? "");
  const [remarks, setRemarks] = useState(existing?.forwardingRemarks ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !rank.trim()) {
      setStatus("error");
      setErrorMessage("Forwarding officer's name and rank are both required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/forwarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        forwardingOfficerName: name.trim(),
        forwardingOfficerRank: rank.trim(),
        forwardingOfficerBadgeNo: badgeNo.trim() || undefined,
        forwardingRemarks: remarks.trim() || undefined,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not save the forwarding endorsement — check your connection and try again.");
      return;
    }

    setStatus("idle");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Stamp className="size-3.5" />
        {existing?.forwardingOfficerName ? "Edit forwarding endorsement" : "Record forwarding endorsement"}
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Forwarding / countersigning officer</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Records the superior officer this report is forwarded through before reaching court — appears as a
            second signature block on the report, alongside the preparing investigating officer&apos;s own.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fwd-name" className="text-text-secondary">
              Officer full name
            </Label>
            <Input id="fwd-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. R. K. Sandhu" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fwd-rank" className="text-text-secondary">
                Rank
              </Label>
              <Input id="fwd-rank" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="e.g. Station House Officer" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fwd-badge" className="text-text-secondary">
                Badge / PIS no. <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <Input id="fwd-badge" value={badgeNo} onChange={(e) => setBadgeNo(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fwd-remarks" className="text-text-secondary">
              Remarks <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <Input id="fwd-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Forwarded for further necessary action." />
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
