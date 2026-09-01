import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditLog } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ACTION_COLOR: Record<string, string> = {
  UPLOADED: "text-accent-primary",
  ANALYZED: "text-status-inconclusive",
  VIEWED: "text-text-secondary",
  OVERRIDDEN: "text-status-warning",
  EXPORTED: "text-status-safe",
  ASSIGNED: "text-status-safe",
};

export default function AuditLogPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Audit Log</h1>
        <p className="text-sm text-text-tertiary">
          Every action taken on evidence, exhaustively recorded — this table is
          intentionally complete, not decorated.
        </p>
      </div>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            Case CHD-2026-00124 — chain of custody
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              {auditLog.map((a) => (
                <TableRow key={a.id} className="border-border-subtle">
                  <TableCell className="font-mono text-xs text-text-secondary">
                    {a.timestamp}
                  </TableCell>
                  <TableCell className="text-sm text-text-primary">{a.actor}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold",
                        ACTION_COLOR[a.action],
                      )}
                    >
                      {a.action}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-text-tertiary">
                    {a.evidenceHash}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-text-tertiary">
                    {a.device}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
