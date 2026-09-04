import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileDown, GitBranch, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddEvidenceDialog } from "@/components/investigation/add-evidence-dialog";
import { EvidenceTabs } from "@/components/investigation/evidence-tabs";
import { ForwardingDialog } from "@/components/investigation/forwarding-dialog";
import { CaptureLinkDialog } from "@/components/investigation/capture-link-dialog";
import { CaseLiveRefresh } from "@/components/investigation/case-live-refresh";
import type { getRealCase } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;

/**
 * Detail view for a real, Phase-1+-created case. Laid out to match the old
 * mock-fed CaseInvestigationView's page chrome (header + action buttons,
 * compact case-particulars strip, investigation panel below) now that
 * Phase 2/3 have made most of that page's slots real — pipeline, fusion,
 * provenance, overrides, cross-case matches. Still says plainly where a
 * slot isn't real yet (face/OSINT search — see EvidenceCard) rather than
 * faking it just to match the old visual.
 */
export function RealCaseView({ caseData }: { caseData: RealCase }) {
  const isSensitive = caseData.sensitivityLevel !== "standard";

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <CaseLiveRefresh />
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
        >
          <ArrowLeft className="size-3.5" />
          Back to cases
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs text-text-tertiary">{caseData.id}</p>
              {isSensitive && (
                <Badge className="border-status-warning/30 bg-status-warning-bg text-status-warning">
                  <ShieldAlert className="size-3 mr-1" />
                  {caseData.sensitivityLevel === "ncii" ? "NCII" : "Minor"}
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold text-text-primary">{caseData.title}</h1>
            {caseData.summary && <p className="mt-1 max-w-2xl text-sm text-text-tertiary">{caseData.summary}</p>}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/cases/${caseData.id}/history`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <Clock className="size-4" />
              History
            </Link>
            <Link
              href={`/cases/${caseData.id}/propagation`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <GitBranch className="size-4" />
              Cross-case &amp; corpus matches
            </Link>
            <Link
              href={`/cases/${caseData.id}/report`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <FileDown className="size-4" />
              Report
            </Link>
            <CaptureLinkDialog caseId={caseData.id} />
            <ForwardingDialog
              caseId={caseData.id}
              existing={{
                forwardingOfficerName: caseData.forwardingOfficerName,
                forwardingOfficerRank: caseData.forwardingOfficerRank,
                forwardingOfficerBadgeNo: caseData.forwardingOfficerBadgeNo,
                forwardingRemarks: caseData.forwardingRemarks,
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Case particulars</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-4">
          <Row label="FIR number" value={caseData.firNumber} />
          {caseData.firDate && <Row label="FIR date" value={new Date(caseData.firDate).toLocaleDateString()} />}
          <Row label="Police station" value={caseData.policeStation} />
          <Row label="District/UT" value={caseData.district} />
          {caseData.offenceSections && <Row label="Sections of law" value={caseData.offenceSections} />}
          {caseData.courtJurisdiction && <Row label="Court jurisdiction" value={caseData.courtJurisdiction} />}
          {caseData.complainantName && <Row label="Complainant" value={caseData.complainantName} />}
          {caseData.accusedDetails && <Row label="Accused" value={caseData.accusedDetails} />}
          {caseData.gdEntryNumber && <Row label="GD entry no." value={caseData.gdEntryNumber} />}
          <Row label="Status" value={caseData.status} capitalize />
          <Row label="Investigator" value={caseData.investigator.name} />
          {caseData.investigatorRank && <Row label="Rank" value={caseData.investigatorRank} />}
          {caseData.investigatorBadgeNo && <Row label="Badge/PIS No." value={caseData.investigatorBadgeNo} mono />}
          <Row label="Opened" value={new Date(caseData.openedAt).toLocaleString()} />
          {caseData.forwardingOfficerName && (
            <Row
              label="Forwarded to"
              value={`${caseData.forwardingOfficerName}, ${caseData.forwardingOfficerRank}`}
            />
          )}
        </dl>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Evidence ({caseData.evidence.length})
          </p>
          <AddEvidenceDialog caseId={caseData.id} />
        </div>
        {caseData.evidence.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-surface p-8 text-center">
            <p className="text-sm text-text-tertiary">No evidence uploaded on this case yet.</p>
          </div>
        ) : (
          <EvidenceTabs caseId={caseData.id} sensitivityLevel={caseData.sensitivityLevel} evidence={caseData.evidence} />
        )}
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
    <div>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className={`text-text-primary ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
