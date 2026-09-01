"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, UserCog } from "lucide-react";
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
import { VerdictBadge } from "@/components/shared/verdict-badge";
import type { Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

const VERDICT_OPTIONS: Verdict[] = ["AUTHENTIC", "MANIPULATED", "AI_GENERATED", "INCONCLUSIVE"];

/**
 * Real, persisted verdict override — closes the gap CaseMetaPanel's mock
 * dialog names explicitly ("shown locally on this panel only... not yet
 * written to the audit trail") for actual cases. Calls
 * POST /api/cases/:caseId/evidence/:evidenceId/override, which requires a
 * FusionVerdict to already exist (409 otherwise, since an override
 * corrects a computed verdict rather than substituting for one) and writes
 * both a VerdictOverride row and a hash-chained OVERRIDDEN audit entry in
 * the same transaction.
 */
export function OverrideDialog({
  caseId,
  evidenceId,
  currentVerdict,
}: {
  caseId: string;
  evidenceId: string;
  currentVerdict: Verdict;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Verdict>(currentVerdict);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!reason.trim()) {
      setStatus("error");
      setErrorMessage("A reason is required for every verdict override.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newVerdict: selected, reason: reason.trim() }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Override failed — check your connection and try again.");
      return;
    }

    setStatus("idle");
    setOpen(false);
    setReason("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "xs" }), "text-text-tertiary hover:text-text-primary")}>
        <UserCog className="size-3.5" />
        Override
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Override verdict</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            This is a real, persisted human correction — it writes a VerdictOverride row and a hash-chained
            audit entry, and is visible on the case report from now on.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 py-2">
          {VERDICT_OPTIONS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setSelected(v)}
              className={cn(
                "rounded-md border p-2 text-left transition-colors",
                selected === v ? "border-accent-primary bg-accent-dim" : "border-border-subtle hover:border-border-strong",
              )}
            >
              <VerdictBadge verdict={v} size="sm" />
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="override-reason" className="text-xs font-medium text-text-secondary">
            Reason <span className="font-normal text-text-tertiary">(required)</span>
          </label>
          <textarea
            id="override-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is the computed verdict being corrected?"
            className="w-full resize-none rounded-lg border border-border-subtle bg-transparent px-2.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-border-strong"
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
            className="bg-accent-primary text-white hover:bg-accent-primary-hover"
          >
            {status === "submitting" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Confirm override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
