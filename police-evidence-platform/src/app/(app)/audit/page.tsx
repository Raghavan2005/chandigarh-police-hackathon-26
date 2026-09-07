import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { getAuditLog } from "@/lib/audit-server";
import { cn, formatTimestamp } from "@/lib/utils";

const ACTION_COLOR: Record<string, string> = {
  UPLOADED: "text-accent-primary",
  ANALYZED: "text-status-inconclusive",
  VIEWED: "text-text-secondary",
  OVERRIDDEN: "text-status-warning",
  EXPORTED: "text-status-safe",
  ASSIGNED: "text-status-safe",
};

/**
 * Global, cross-case audit trail — admin-only per PS4_MVP_BUILD_PLAN.md §2
 * ("only admin can view the global audit log"; investigators only see a
 * case's own chain of custody from inside that case). This is the first
 * page in the app to actually enforce that role check.
 */
export default async function AuditLogPage() {
  const session = await getSession();

  if (!session) {
    return null; // (app)/layout.tsx already redirects unauthenticated users before this renders.
  }

  if (session.role !== "admin") {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface p-10 text-center">
          <ShieldX className="size-8 text-status-critical" />
          <h1 className="text-lg font-semibold text-text-primary">Admin access required</h1>
          <p className="max-w-sm text-sm text-text-tertiary">
            The global audit log spans every case in the system, so it&apos;s restricted to admin accounts. Your
            role is <span className="font-mono text-text-secondary">{session.role}</span>. A case&apos;s own chain
            of custody is still visible from inside that case.
          </p>
        </div>
      </div>
    );
  }

  const { entries, verification } = await getAuditLog();

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Audit Log</h1>
        <p className="text-sm text-text-tertiary">
          Every action taken on evidence, across every case, exhaustively recorded — this table is intentionally
          complete, not decorated.
        </p>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
          verification.intact
            ? "border-status-safe/30 bg-status-safe-bg text-status-safe"
            : "border-status-critical/30 bg-status-critical-bg text-status-critical",
        )}
      >
        {verification.intact ? <ShieldCheck className="size-4 shrink-0" /> : <ShieldAlert className="size-4 shrink-0" />}
        {verification.intact ? (
          <span>
            Hash chain verified — all {verification.totalEntries} entries link correctly, oldest to newest, and
            match storage/audit-checkpoints.log. No tampering detected.
          </span>
        ) : verification.brokenAtId !== null ? (
          <span>
            Hash chain broken at entry #{verification.brokenAtId} — its recorded previous-entry hash doesn&apos;t
            match the entry before it. This entry (or one before it) may have been altered outside the app.
          </span>
        ) : (
          <span>
            {verification.checkpointMismatchIds.length} entr{verification.checkpointMismatchIds.length === 1 ? "y" : "ies"} (#
            {verification.checkpointMismatchIds.join(", #")}) disagree{verification.checkpointMismatchIds.length === 1 ? "s" : ""} with
            storage/audit-checkpoints.log — the DB chain looks internally consistent, but its recorded hash for this entry
            doesn&apos;t match what was independently logged when it was created. That combination is the specific signature
            of a rewritten DB row with recomputed downstream hashes.
          </span>
        )}
      </div>

      {verification.checkpointMissingIds.length > 0 && (
        <p className="text-[11px] text-text-tertiary">
          Note: {verification.checkpointMissingIds.length} entr{verification.checkpointMissingIds.length === 1 ? "y has" : "ies have"} no
          corresponding line in storage/audit-checkpoints.log (#{verification.checkpointMissingIds.join(", #")}) — not counted as a
          tamper signal on its own (e.g. possible on a freshly reset dev DB), but worth checking directly if unexpected.
        </p>
      )}

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            All cases — {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-tertiary">No audit activity recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="font-mono text-text-tertiary">Timestamp</TableHead>
                  <TableHead className="text-text-tertiary">Actor</TableHead>
                  <TableHead className="text-text-tertiary">Action</TableHead>
                  <TableHead className="text-text-tertiary">Case</TableHead>
                  <TableHead className="font-mono text-text-tertiary">Evidence hash</TableHead>
                  <TableHead className="text-right text-text-tertiary">Device / IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((a) => (
                  <TableRow key={a.id} className="border-border-subtle">
                    <TableCell className="font-mono text-xs text-text-secondary">
                      {formatTimestamp(a.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm text-text-primary">{a.actor?.name ?? "System"}</TableCell>
                    <TableCell>
                      <span className={cn("font-mono text-xs font-semibold", ACTION_COLOR[a.action])}>
                        {a.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-secondary">{a.caseId}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-mono text-xs text-text-tertiary">
                      {a.evidenceHash ?? "—"}
                    </TableCell>
                    <TableCell
                      className="max-w-[220px] truncate text-right font-mono text-xs text-text-tertiary"
                      title={a.device ?? undefined}
                    >
                      {a.device ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
