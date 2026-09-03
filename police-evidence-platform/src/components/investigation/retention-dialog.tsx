"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Lock } from "lucide-react";
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

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

/**
 * Evidence Vault Phase C — retention/legal-hold flags (Docs/Plan for the
 * feature). Flags only, reached from the Vault detail page: no disposal
 * workflow reads retentionUntil yet, so setting it here never deletes
 * anything by itself.
 */
export function RetentionDialog({
  evidenceId,
  legalHold: initialLegalHold,
  retentionUntil: initialRetentionUntil,
}: {
  evidenceId: string;
  legalHold: boolean;
  retentionUntil: Date | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [legalHold, setLegalHold] = useState(initialLegalHold);
  const [retentionUntil, setRetentionUntil] = useState(toDateInputValue(initialRetentionUntil));
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/evidence/${evidenceId}/retention`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        legalHold,
        retentionUntil: retentionUntil || null,
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not save — check your connection and try again.");
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
        <Lock className="size-3.5" />
        {initialLegalHold || initialRetentionUntil ? "Edit retention / hold" : "Set retention / hold"}
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Retention &amp; legal hold</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Flags only — nothing in this system currently deletes evidence automatically. Legal hold marks this
            exhibit as exempt from any future disposal workflow regardless of the retention date below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={legalHold}
              onChange={(e) => setLegalHold(e.target.checked)}
              className="size-4 rounded border-border-subtle"
            />
            Legal hold — exempt from disposal
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="retention-until" className="text-text-secondary">
              Retain until <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <input
              id="retention-until"
              type="date"
              value={retentionUntil}
              onChange={(e) => setRetentionUntil(e.target.value)}
              className="h-9 rounded-md border border-border-subtle bg-surface px-2.5 text-sm text-text-primary outline-none focus:border-border-strong"
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
