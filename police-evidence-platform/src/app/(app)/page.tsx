import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { AnomalyTrendChart } from "@/components/dashboard/anomaly-trend-chart";
import { RecentAlertsTable } from "@/components/dashboard/recent-alerts-table";
import { RelationshipSnapshot } from "@/components/dashboard/relationship-snapshot";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { listRealCases } from "@/lib/cases-server";
import { getDashboardKpis, getFlaggedMediaTrend, getCrossCaseLinkSummary } from "@/lib/dashboard-server";

export default async function DashboardPage() {
  const [cases, kpis, flaggedTrend, linkSummary] = await Promise.all([
    listRealCases(),
    getDashboardKpis(),
    getFlaggedMediaTrend(),
    getCrossCaseLinkSummary(),
  ]);
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-tertiary">
            Overview of evidence intake and investigations across your unit.
          </p>
        </div>
        <Link
          href="/cases/new"
          className={buttonVariants({
            size: "sm",
            className: "bg-accent-primary text-white hover:bg-accent-primary-hover",
          })}
        >
          <Plus className="size-4" />
          New Case
        </Link>
      </div>

      <KpiRow kpis={kpis} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border-subtle bg-surface shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              Flagged media volume — last 16 weeks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnomalyTrendChart data={flaggedTrend} />
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              Entity relationship snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RelationshipSnapshot summary={linkSummary} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            Recent alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentAlertsTable cases={cases.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
}
