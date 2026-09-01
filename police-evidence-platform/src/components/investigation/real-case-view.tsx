import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileBarChart, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EvidenceCard } from "@/components/investigation/evidence-card";
import type { getRealCase } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;

/**
 * Detail view for a real, Phase-1-created case — deliberately not the
 * mock-fed CaseInvestigationView, which expects pipeline/fusion/propagation
 * data that doesn't exist for a real case until Phase 2's detection service
 * and fusion engine are wired in. This shows exactly what's real today:
 * case/FIR particulars and the evidence's actual extracted metadata — and
 * says plainly that analysis hasn't run, rather than faking a verdict.
 */
export function RealCaseView({ caseData }: { caseData: RealCase }) {
  const isSensitive = caseData.sensitivityLevel !== "standard";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
        >
          <ArrowLeft className="size-3.5" />
          Back to cases
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-text-primary">{caseData.title}</h1>
          {isSensitive && (
            <Badge className="border-status-warning/30 bg-status-warning-bg text-status-warning">
              <ShieldAlert className="size-3 mr-1" />
              {caseData.sensitivityLevel === "ncii" ? "NCII" : "Minor"}
            </Badge>
          )}
        </div>
        {caseData.summary && <p className="mt-1 text-sm text-text-secondary">{caseData.summary}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border-subtle bg-surface shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              Evidence ({caseData.evidence.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {caseData.evidence.length === 0 && (
              <p className="py-6 text-center text-sm text-text-tertiary">
                No evidence uploaded on this case yet.
              </p>
            )}
            {caseData.evidence.map((ev) => (
              <EvidenceCard
                key={ev.id}
                caseId={caseData.id}
                evidenceKind={caseData.evidenceKind}
                sensitivityLevel={caseData.sensitivityLevel}
                evidence={ev}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">Case particulars</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              <Row label="Case ID" value={caseData.id} mono />
              <Row label="FIR number" value={caseData.firNumber} />
              <Row label="Police station" value={caseData.policeStation} />
              <Row label="District/UT" value={caseData.district} />
              <Row label="Status" value={caseData.status} capitalize />
              <Row label="Investigator" value={caseData.investigator.name} />
              {caseData.investigatorRank && <Row label="Rank" value={caseData.investigatorRank} />}
              {caseData.investigatorBadgeNo && <Row label="Badge/PIS No." value={caseData.investigatorBadgeNo} mono />}
              <Row label="Opened" value={new Date(caseData.openedAt).toLocaleString()} />
            </dl>
            <Link
              href={`/cases/${caseData.id}/report`}
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-4 w-full justify-start bg-accent-primary text-white hover:bg-accent-primary-hover",
              )}
            >
              <FileBarChart className="size-4" />
              View report
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={`text-right text-text-primary ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
