"use client";

import Link from "next/link";
import { useState } from "react";
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
import type { CaseSummary, Verdict } from "@/lib/types";
import { FileDown, UserPlus, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const VERDICT_OPTIONS: Verdict[] = [
  "AUTHENTIC",
  "MANIPULATED",
  "AI_GENERATED",
  "INCONCLUSIVE",
];

export function CaseMetaPanel({ caseData }: { caseData: CaseSummary }) {
  const [overridden, setOverridden] = useState<Verdict | null>(null);
  const [open, setOpen] = useState(false);

  const effectiveVerdict = overridden ?? caseData.verdict;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Case metadata
        </p>
        <dl className="mt-3 space-y-2.5 text-sm">
          <Row label="Case ID" value={<span className="font-mono">{caseData.id}</span>} />
          <Row label="Investigator" value={caseData.investigator} />
          <Row
            label="Status"
            value={<span className="capitalize">{caseData.status}</span>}
          />
          <Row label="Opened" value={caseData.updatedRelative} />
          <Row label="Evidence type" value={<span className="capitalize">{caseData.evidenceKind}</span>} />
          {overridden && (
            <Row
              label="Current verdict"
              value={<VerdictBadge verdict={effectiveVerdict} size="sm" />}
            />
          )}
        </dl>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Technical Provenance
        </p>
        <dl className="mt-3 space-y-2.5 text-sm">
          <Row label="SHA-256" value={<span className="font-mono text-[10px]">9a3f2b4e...7d1c</span>} />
          {caseData.evidenceKind === "video" ? (
            <>
              <Row label="Codec" value={<span className="font-mono text-xs">H.264 / AAC</span>} />
              <Row label="Resolution" value="1920x1080 (30fps)" />
            </>
          ) : caseData.evidenceKind === "image" ? (
            <>
              <Row label="Format" value={<span className="font-mono text-xs">JPEG (sRGB)</span>} />
              <Row label="Resolution" value="2048x1536" />
            </>
          ) : (
            <Row label="Format" value={<span className="font-mono text-xs">Audio (MP3)</span>} />
          )}
          <Row label="EXIF Data" value={<span className="text-status-warning">Stripped</span>} />
          <Row label="C2PA Manifest" value={<span className="text-status-critical">No Signature</span>} />
        </dl>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Actions
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start")}
          >
            <UserCog className="size-4" />
            Override verdict
          </DialogTrigger>
          <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
            <DialogHeader>
              <DialogTitle>Override verdict — {caseData.id}</DialogTitle>
              <DialogDescription className="text-text-tertiary">
                Human-in-the-loop review. Demo build — overrides are shown
                locally on this panel only and are not yet written to the
                audit trail or reflected elsewhere on the case.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 py-2">
              {VERDICT_OPTIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setOverridden(v)}
                  className={cn(
                    "rounded-md border p-2 text-left transition-colors",
                    effectiveVerdict === v
                      ? "border-accent-primary bg-accent-dim"
                      : "border-border-subtle hover:border-border-strong",
                  )}
                >
                  <VerdictBadge verdict={v} size="sm" />
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="bg-accent-primary text-white hover:bg-accent-primary-hover"
              >
                Confirm override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start")}
        >
          <UserPlus className="size-4" />
          Assign investigator
        </button>

        <Link
          href={`/cases/${caseData.id}/report`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "justify-start bg-accent-primary text-white hover:bg-accent-primary-hover",
          )}
        >
          <FileDown className="size-4" />
          Export report
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}
