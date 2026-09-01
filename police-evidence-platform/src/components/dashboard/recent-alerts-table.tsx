import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";
import { Clock, EyeOff } from "lucide-react";
import type { RealCaseSummary } from "@/lib/cases-server";
import type { EvidenceKind } from "@/lib/types";

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Real cases (Phase 1) have no verdict/confidence yet — Evidence Fusion is
 * Phase 2 scope. Rendering a fake verdict here would be exactly the kind of
 * overclaiming the whole plan is built against, so this shows an honest
 * "pending analysis" state instead of reusing VerdictBadge.
 */
export function RecentAlertsTable({ cases }: { cases: RealCaseSummary[] }) {
  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <p className="text-sm text-text-secondary">No cases yet.</p>
        <p className="text-xs text-text-tertiary">
          Create a case to submit evidence for analysis.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border-subtle hover:bg-transparent">
          <TableHead className="text-text-tertiary">Case</TableHead>
          <TableHead className="text-text-tertiary">Status</TableHead>
          <TableHead className="text-text-tertiary">Evidence</TableHead>
          <TableHead className="text-text-tertiary">Investigator</TableHead>
          <TableHead className="text-right text-text-tertiary">Opened</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((c) => {
          const Icon = KIND_ICON[c.evidenceKind as EvidenceKind] ?? Clock;
          const isSensitive = c.sensitivityLevel !== "standard";
          return (
            <TableRow key={c.id} className="border-border-subtle">
              <TableCell>
                <Link href={`/cases/${c.id}`} className="flex items-center gap-3 hover:underline">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-border-subtle bg-surface-sunken">
                    {isSensitive ? (
                      <EyeOff className="size-3.5 text-status-warning" />
                    ) : (
                      <Icon className="size-3.5 text-text-tertiary" />
                    )}
                  </div>
                  <span className="flex flex-col">
                    <span className="font-mono text-xs text-text-tertiary">{c.id}</span>
                    <span className="text-sm text-text-primary">{c.title}</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md border border-status-neutral/30 bg-surface-sunken px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                  {c.status}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm text-text-secondary tabular-nums">
                {c.evidenceCount} file{c.evidenceCount === 1 ? "" : "s"}
              </TableCell>
              <TableCell className="text-sm text-text-secondary">{c.investigatorName}</TableCell>
              <TableCell className="text-right text-xs text-text-tertiary">
                {relativeTime(c.openedAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
