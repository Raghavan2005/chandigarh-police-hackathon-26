import Link from "next/link";
import { ArrowUpRight, GitCompareArrows } from "lucide-react";
import type { CrossCaseLinkSummary } from "@/lib/dashboard-server";

/**
 * Real replacement for the old fixed fake mini-graph (six hardcoded nodes
 * labeled Telegram/X/WhatsApp/Facebook, invented edges, linking to a mock
 * FEATURED_CASE_ID). Cross-case matching only recently started producing
 * real EvidenceMatch rows (verified live this session), and the dataset is
 * genuinely small right now — a decorative force-graph would mostly be
 * empty space or invented positions, so this shows real counts and an
 * honest empty state instead of faking a populated graph.
 */
export function RelationshipSnapshot({ summary }: { summary: CrossCaseLinkSummary }) {
  if (summary.totalLinks === 0) {
    return (
      <div className="flex h-28 flex-col items-center justify-center gap-2 text-center">
        <GitCompareArrows className="size-5 text-text-tertiary" />
        <p className="max-w-[220px] text-[11px] text-text-tertiary">
          No cross-case links yet — this appears once the same file is uploaded across two different cases.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-text-tertiary">Linked cases</p>
          <p className="font-mono text-lg font-semibold text-text-primary">{summary.linkedCaseCount}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-tertiary">Total matches</p>
          <p className="font-mono text-lg font-semibold text-text-primary">{summary.totalLinks}</p>
        </div>
      </div>
      {summary.exampleCaseId && (
        <Link
          href={`/cases/${summary.exampleCaseId}/propagation`}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent-primary hover:text-accent-primary-hover"
        >
          View matches <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
