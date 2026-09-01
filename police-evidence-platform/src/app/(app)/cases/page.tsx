import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentAlertsTable } from "@/components/dashboard/recent-alerts-table";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { listRealCases } from "@/lib/cases-server";

export default async function CasesPage() {
  const cases = await listRealCases();
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Cases</h1>
          <p className="text-sm text-text-tertiary">
            All open and closed investigations assigned to your unit.
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

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            All cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentAlertsTable cases={cases} />
        </CardContent>
      </Card>
    </div>
  );
}
