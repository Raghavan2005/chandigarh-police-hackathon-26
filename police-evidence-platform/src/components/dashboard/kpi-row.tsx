import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/dashboard/sparkline";
import type { Kpi } from "@/lib/dashboard-server";

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          className="gap-3 border-border-subtle bg-surface p-4 shadow-none"
        >
          <p className="text-xs font-medium text-text-secondary">{kpi.label}</p>
          <div className="flex items-end justify-between gap-3">
            <p className="font-mono text-2xl font-semibold text-text-primary tabular-nums">
              {kpi.value}
            </p>
            <Sparkline points={kpi.trend} className="h-8 w-24" />
          </div>
          <p className="text-[11px] text-text-tertiary">{kpi.delta}</p>
        </Card>
      ))}
    </div>
  );
}
