import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatTimestamp } from "@/lib/utils";

const ACTION_COLOR: Record<string, string> = {
  UPLOADED: "text-accent-primary",
  ANALYZED: "text-status-inconclusive",
  VIEWED: "text-text-secondary",
  OVERRIDDEN: "text-status-warning",
  EXPORTED: "text-status-safe",
  ASSIGNED: "text-status-safe",
  CUSTODY_TRANSFERRED: "text-status-warning",
};

export interface CaseHistoryRow {
  id: string | number;
  timestamp: Date | string;
  actorName: string | null;
  action: string;
  evidenceHash: string | null;
  device: string | null;
}

/**
 * Case-scoped view of the same rows that make up the global /audit page —
 * deliberately not re-running that page's hash-chain verification here: the
 * chain links every entry across every case in sequence, so a per-case
 * subset can't validly report "intact"/"broken" on its own. Tamper
 * verification stays the admin-only /audit page's job; this just answers
 * "what happened on this case," which any investigator on the case needs.
 */
export function CaseHistoryTable({ rows }: { rows: CaseHistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-text-tertiary">No activity recorded on this case yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border-subtle hover:bg-transparent">
          <TableHead className="font-mono text-text-tertiary">Timestamp</TableHead>
          <TableHead className="text-text-tertiary">Actor</TableHead>
          <TableHead className="text-text-tertiary">Action</TableHead>
          <TableHead className="font-mono text-text-tertiary">Evidence hash</TableHead>
          <TableHead className="text-right text-text-tertiary">Device / IP</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} className="border-border-subtle">
            <TableCell className="font-mono text-xs text-text-secondary">
              {formatTimestamp(new Date(r.timestamp))}
            </TableCell>
            <TableCell className="text-sm text-text-primary">{r.actorName ?? "System"}</TableCell>
            <TableCell>
              <span className={cn("font-mono text-xs font-semibold", ACTION_COLOR[r.action] ?? "text-text-secondary")}>
                {r.action}
              </span>
            </TableCell>
            <TableCell className="max-w-[220px] truncate font-mono text-xs text-text-tertiary">
              {r.evidenceHash ?? "—"}
            </TableCell>
            <TableCell
              className="max-w-[220px] truncate text-right font-mono text-xs text-text-tertiary"
              title={r.device ?? undefined}
            >
              {r.device ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
