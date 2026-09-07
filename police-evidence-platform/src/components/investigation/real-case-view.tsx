import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileDown, GitBranch, Network, Radar, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDateOnly, formatTimestamp } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddEvidenceDialog } from "@/components/investigation/add-evidence-dialog";
import { EvidenceTabs } from "@/components/investigation/evidence-tabs";
import { ForwardingDialog } from "@/components/investigation/forwarding-dialog";
import { CaptureLinkDialog } from "@/components/investigation/capture-link-dialog";
import { CaseLiveRefresh } from "@/components/investigation/case-live-refresh";
import { SightingMap } from "@/components/propagation/sighting-map";
import { RealPropagationSummary } from "@/components/propagation/real-propagation-summary";
import { SourceFinderTab } from "@/components/investigation/source-finder-tab";
import type { getRealCase } from "@/lib/cases-server";
import type { EvidencePropagation } from "@/lib/propagation-server";

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
export function RealCaseView({
  caseData,
  propagation,
}: {
  caseData: RealCase;
  propagation: EvidencePropagation[];
}) {
  const isSensitive = caseData.sensitivityLevel !== "standard";
  const crossCaseMatchCount = propagation.filter((ev) => ev.sightings.length > 1).length;
  const sourceFinderResultCount = caseData.evidence.filter((ev) => ev.webSearchResult).length;

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
              href={`/cases/${caseData.id}/report`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <FileDown className="size-4" />
              Report
            </Link>
            <Link
              href={`/cases/${caseData.id}/mindmap`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <Network className="size-4" />
              Mind map
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
          {caseData.firDate && <Row label="FIR date" value={formatDateOnly(new Date(caseData.firDate))} />}
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
          <Row label="Opened" value={formatTimestamp(new Date(caseData.openedAt))} />
          {caseData.forwardingOfficerName && (
            <Row
              label="Forwarded to"
              value={`${caseData.forwardingOfficerName}, ${caseData.forwardingOfficerRank}`}
            />
          )}
        </dl>
      </div>

      <Tabs defaultValue="evidence">
        <div className="mb-3 flex items-center justify-between">
          <TabsList variant="line" className="border-b border-border-subtle">
            <TabsTrigger value="evidence" className="gap-1.5">
              Evidence ({caseData.evidence.length})
            </TabsTrigger>
            <TabsTrigger value="propagation" className="gap-1.5">
              <GitBranch className="size-3.5" />
              Cross-case &amp; corpus matches
              {crossCaseMatchCount > 0 && (
                <span className="ml-1 rounded-full bg-accent-dim px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-primary">
                  {crossCaseMatchCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="source-finder" className="gap-1.5">
              <Radar className="size-3.5" />
              Source finder
              {sourceFinderResultCount > 0 && (
                <span className="ml-1 rounded-full bg-accent-dim px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-primary">
                  {sourceFinderResultCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <AddEvidenceDialog caseId={caseData.id} />
        </div>

        <TabsContent value="evidence" className="mt-4">
          {caseData.evidence.length === 0 ? (
            <div className="rounded-lg border border-border-subtle bg-surface p-8 text-center">
              <p className="text-sm text-text-tertiary">No evidence uploaded on this case yet.</p>
            </div>
          ) : (
            <EvidenceTabs caseId={caseData.id} sensitivityLevel={caseData.sensitivityLevel} evidence={caseData.evidence} />
          )}
        </TabsContent>

        <TabsContent value="propagation" className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-text-tertiary">
            Real matches found for this case&apos;s evidence, ordered by timestamp — not a live/OSINT spread
            scrape (that&apos;s an explicit non-goal), so most evidence with no matches will show only its own
            upload here, which is the expected honest result.
          </p>

          <Card className="border-border-subtle bg-surface shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-text-secondary">Geographic trace</CardTitle>
            </CardHeader>
            <CardContent>
              <SightingMap evidence={propagation} />
            </CardContent>
          </Card>

          <Card className="border-border-subtle bg-surface shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-text-secondary">Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <RealPropagationSummary evidence={propagation} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source-finder" className="mt-4">
          <SourceFinderTab
            caseId={caseData.id}
            sensitivityLevel={caseData.sensitivityLevel}
            evidence={caseData.evidence}
            propagation={propagation}
          />
        </TabsContent>
      </Tabs>
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
