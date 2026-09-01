import { notFound } from "next/navigation";
import { caseById } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropagationGraph } from "@/components/propagation/propagation-graph";

export default async function PropagationPage(
  props: PageProps<"/cases/[caseId]/propagation">,
) {
  const { caseId } = await props.params;
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
