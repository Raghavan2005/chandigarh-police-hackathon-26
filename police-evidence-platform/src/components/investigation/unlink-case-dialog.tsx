"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Unlink } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-border-subtle bg-transparent px-2.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-border-strong";

/**
 * Soft-unlinks a case from an investigation (Docs/Plan for the feature) —
 * the link row is never deleted, just marked unlinked with a reason, same
 * append-only-history pattern as the rest of this app.
 */
export function UnlinkCaseDialog({ investigationId, caseId }: { investigationId: string; caseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unlinkReason, setUnlinkReason] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!unlinkReason.trim()) {
      setStatus("error");
      setErrorMessage("A reason for unlinking is required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/investigations/${investigationId}/cases/${caseId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlinkReason: unlinkReason.trim() }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not unlink this case — check your connection and try again.");
      return;
    }

    setStatus("idle");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "xs" }), "text-text-tertiary hover:text-status-critical")}
      >
        <Unlink className="size-3.5" />
        Unlink
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Unlink case {caseId}</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            The link isn&apos;t deleted — it stays on record as unlinked, with your reason, so the fact this
            connection was once asserted (and later withdrawn) isn&apos;t lost.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-1">
          <Label htmlFor="unlink-reason" className="text-text-secondary">
            Reason
          </Label>
          <textarea
            id="unlink-reason"
            value={unlinkReason}
            onChange={(e) => setUnlinkReason(e.target.value)}
            rows={3}
            placeholder="Why is this case no longer believed connected?"
            className={TEXTAREA_CLASS}
          />
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
            className="bg-status-critical text-white hover:bg-status-critical/90"
          >
            {status === "submitting" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Unlink
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
