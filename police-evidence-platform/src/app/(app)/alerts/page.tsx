import Link from "next/link";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatTimestamp } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { listAlertsForUser } from "@/lib/alerts-server";
import { AcknowledgeAlertButton } from "@/components/investigation/acknowledge-alert-button";

const SEVERITY_ICON: Record<string, React.ElementType> = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-status-critical border-status-critical/30 bg-status-critical-bg",
  warning: "text-status-warning border-status-warning/30 bg-status-warning-bg",
  info: "text-text-tertiary border-border-subtle bg-surface-sunken",
};

/**
 * Alerts (Docs/Plan for the feature) — pull model, no push/websocket
 * delivery: MANIPULATED/AI_GENERATED verdicts, cross-case hash matches,
 * and (platform-wide, admin-only) audit hash-chain integrity failures.
 * Visibility matches listAlertsForUser's own rule — nothing here is
 * fetched or shown beyond what that function already scoped.
 */
export default async function AlertsPage() {
  const session = await getSession();
  if (!session) return null; // (app)/layout.tsx already redirects unauthenticated users before this renders.

  const alerts = await listAlertsForUser(session.userId, session.role);
  const active = alerts.filter((a) => !a.acknowledgedAt);
  const acknowledged = alerts.filter((a) => a.acknowledgedAt);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Alerts</h1>
        <p className="text-sm text-text-tertiary">
          Manipulated/AI-generated verdicts, cross-case hash matches on your cases, and — for admins — audit-log
          integrity failures.
        </p>
      </div>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            {active.length} unacknowledged
          </CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-tertiary">Nothing needs your attention right now.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {active.map((alert) => {
                const Icon = SEVERITY_ICON[alert.severity] ?? Info;
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-md border p-3",
                      SEVERITY_CLASS[alert.severity] ?? SEVERITY_CLASS.info,
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs opacity-80">
                          <span className="font-mono uppercase tracking-wide">{alert.type}</span>
                          {alert.case && (
                            <>
                              <span>&middot;</span>
                              <Link href={`/cases/${alert.case.id}`} className="hover:underline">
                                {alert.case.id} — {alert.case.title}
                              </Link>
                            </>
                          )}
                          <span>&middot;</span>
                          <span>{formatTimestamp(alert.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <AcknowledgeAlertButton alertId={alert.id} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {acknowledged.length > 0 && (
        <Card className="border-border-subtle bg-surface shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              Acknowledged ({acknowledged.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {acknowledged.map((alert) => (
                <div key={alert.id} className="border-t border-border-subtle pt-2 text-xs text-text-tertiary first:border-t-0 first:pt-0">
                  <span className="font-mono uppercase tracking-wide">{alert.type}</span> — {alert.message}
                  <p className="mt-0.5">
                    Acknowledged by {alert.acknowledgedBy?.name ?? "—"} ({alert.acknowledgedAt ? formatTimestamp(alert.acknowledgedAt) : "—"})
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
