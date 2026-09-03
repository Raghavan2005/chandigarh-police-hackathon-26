"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";
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

export function RemoveActorDialog({ investigationId, actorId }: { investigationId: string; actorId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!removeReason.trim()) {
      setStatus("error");
      setErrorMessage("A reason for removing this actor is required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/investigations/${investigationId}/actors/${actorId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeReason: removeReason.trim() }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not remove this actor — check your connection and try again.");
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
        <X className="size-3.5" />
        Remove
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Remove suspected actor</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Not deleted — stays on record as removed, with your reason.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-1">
          <Label htmlFor="actor-remove-reason" className="text-text-secondary">
            Reason
          </Label>
          <textarea
            id="actor-remove-reason"
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
            rows={3}
            placeholder="Why is this handle no longer believed relevant?"
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
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
