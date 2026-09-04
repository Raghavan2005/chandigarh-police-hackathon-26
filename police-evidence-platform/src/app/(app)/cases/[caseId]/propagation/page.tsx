import { notFound } from "next/navigation";
import { caseById } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropagationGraph } from "@/components/propagation/propagation-graph";
import { RealPropagationSummary } from "@/components/propagation/real-propagation-summary";
import { SightingMap } from "@/components/propagation/sighting-map";
import { getRealCase } from "@/lib/cases-server";
import { getRealCasePropagation } from "@/lib/propagation-server";

export default async function PropagationPage(
  props: PageProps<"/cases/[caseId]/propagation">,
) {
  const { caseId } = await props.params;

  // Same real-DB-first, mock-fallback pattern as the case detail/report
  // pages — this page previously only handled mock cases and 404'd for any
  // real one.
  const realCase = await getRealCase(caseId);
  if (realCase) {
    const propagation = await getRealCasePropagation(caseId);
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
        <div>
          <p className="font-mono text-xs text-text-tertiary">{realCase.id}</p>
          <h1 className="text-xl font-semibold text-text-primary">Cross-case & corpus matches</h1>
          <p className="text-sm text-text-tertiary">
            Real matches found for this case&apos;s evidence, ordered by timestamp — not a live/OSINT spread
            scrape (that&apos;s an explicit non-goal), so most evidence with no matches will show only its own
            upload here, which is the expected honest result.
          </p>
        </div>

        <Card className="border-border-subtle bg-surface shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">{realCase.title} — geographic trace</CardTitle>
          </CardHeader>
          <CardContent>
            <SightingMap evidence={propagation} />
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">{realCase.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <RealPropagationSummary evidence={propagation} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const caseData = caseById(caseId);
  if (!caseData) notFound();

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div>
        <p className="font-mono text-xs text-text-tertiary">{caseData.id}</p>
        <h1 className="text-xl font-semibold text-text-primary">Propagation graph</h1>
        <p className="text-sm text-text-tertiary">
          How this evidence spread across sources, ordered by first-seen timestamp.
        </p>
      </div>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            {caseData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PropagationGraph caseId={caseData.id} />
        </CardContent>
      </Card>
    </div>
  );
}
