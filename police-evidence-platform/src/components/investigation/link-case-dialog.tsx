"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Link2, Loader2 } from "lucide-react";
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
 * Links one more case into an existing investigation (Docs/Plan for the
 * feature). Excludes cases already actively linked, since re-picking one
 * would 409 — linkedCaseIds is the caller's own already-fetched list, no
 * extra round trip needed just to filter this dropdown.
 */
export function LinkCaseDialog({
  investigationId,
  cases,
  linkedCaseIds,
}: {
  investigationId: string;
  cases: { id: string; title: string }[];
  linkedCaseIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [justification, setJustification] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const linkable = cases.filter((c) => !linkedCaseIds.includes(c.id));

  async function handleSubmit() {
    if (!caseId) {
      setStatus("error");
      setErrorMessage("Select a case to link.");
      return;
    }
    if (!justification.trim()) {
      setStatus("error");
      setErrorMessage("A justification is required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/investigations/${investigationId}/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, justification: justification.trim() }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not link this case — check your connection and try again.");
      return;
    }

    setStatus("idle");
    setOpen(false);
    setCaseId("");
    setJustification("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        <Link2 className="size-4" />
        Add case
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Link a case</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Record why this case is believed connected — this justification is kept on the link, not just this
            dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-case" className="text-text-secondary">
              Case
            </Label>
            {linkable.length === 0 ? (
              <p className="text-xs text-text-tertiary">Every existing case is already linked.</p>
            ) : (
              <select
                id="link-case"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="h-9 rounded-md border border-border-subtle bg-surface px-2.5 text-sm text-text-primary outline-none focus:border-border-strong"
              >
                <option value="">Select a case&hellip;</option>
                {linkable.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-justification" className="text-text-secondary">
              Justification
            </Label>
            <textarea
              id="link-justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              placeholder="Why is this case believed connected?"
              className={TEXTAREA_CLASS}
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
            disabled={status === "submitting" || linkable.length === 0}
            className="bg-accent-primary text-white hover:bg-accent-primary-hover"
          >
            {status === "submitting" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Link case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
