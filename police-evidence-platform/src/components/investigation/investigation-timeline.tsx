import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InvestigationTimelineEntry } from "@/lib/investigations-server";

const ACTION_COLOR: Record<string, string> = {
  UPLOADED: "text-accent-primary",
  ANALYZED: "text-status-inconclusive",
  VIEWED: "text-text-secondary",
  OVERRIDDEN: "text-status-warning",
  EXPORTED: "text-status-safe",
  ASSIGNED: "text-status-safe",
  CUSTODY_TRANSFERRED: "text-status-warning",
};

/**
 * Investigations Phase C (Docs/Plan) — one merged, chronological feed of
 * every linked case's own audit trail. Same "merge, don't re-derive"
 * approach the Evidence Vault's cross-case custody roll-up already used.
 */
export function InvestigationTimeline({ entries }: { entries: InvestigationTimelineEntry[] }) {
  return (
    <Card className="border-border-subtle bg-surface shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          <Clock className="size-4" />
          Cross-case timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-text-tertiary">No audit activity recorded yet on any linked case.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((e) => (
              <div key={e.id} className="flex items-baseline gap-2 border-t border-border-subtle pt-2 text-xs first:border-t-0 first:pt-0">
                <span className="shrink-0 font-mono text-text-tertiary">{new Date(e.timestamp).toLocaleString()}</span>
                <span className={cn("shrink-0 font-mono font-semibold", ACTION_COLOR[e.action] ?? "text-text-secondary")}>
                  {e.action}
                </span>
                <span className="text-text-secondary">{e.actorName ?? "System"}</span>
                <span className="text-text-tertiary">on</span>
                <Link
                  href={`/cases/${e.caseId}`}
                  className={cn(
                    "truncate hover:underline",
                    e.isCaseActivelyLinked ? "text-accent-primary" : "text-text-tertiary line-through",
                  )}
                  title={e.isCaseActivelyLinked ? undefined : "This case has since been unlinked from this investigation"}
                >
                  {e.caseId} — {e.caseTitle}
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
