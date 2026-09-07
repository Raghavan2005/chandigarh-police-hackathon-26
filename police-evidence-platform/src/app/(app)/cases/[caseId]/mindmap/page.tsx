import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getRealCase } from "@/lib/cases-server";
import { aggregateCaseText } from "@/lib/mindmap-server";
import { MindMapPanel, type CachedCaseMindMap } from "@/components/mindmap/mindmap-panel";

/**
 * Cross-evidence relationship mind map (PS4_USE_CASES.md #6) — alongside
 * the existing History/Propagation/Report links on the case detail page.
 * Real-case only, deliberately no mock-data fallback: the old curated
 * mock cases (mock-data.ts) have no per-exhibit analysis rows to
 * synthesize across (no TranscriptResult/ImageDescriptionResult/etc — that
 * data model didn't exist yet when they were authored), so there is
 * nothing honest to build a mock path against here; a real case with no
 * analyzed exhibits already gets its own honest empty state below, which
 * is the correct treatment for "nothing to synthesize yet," not a 404.
 */
export default async function MindMapPage(props: PageProps<"/cases/[caseId]/mindmap">) {
  const { caseId } = await props.params;

  const realCase = await getRealCase(caseId);
  if (!realCase) notFound();

  const aggregation = aggregateCaseText(realCase);
  const cachedRow = await db.caseMindMap.findUnique({ where: { caseId } });
  const cached: CachedCaseMindMap | null = cachedRow
    ? {
        entities: JSON.parse(cachedRow.entitiesJson),
        relationships: JSON.parse(cachedRow.relationshipsJson),
        summary: cachedRow.summary,
        exhibitCount: cachedRow.exhibitCount,
        ranAt: cachedRow.ranAt.toISOString(),
      }
    : null;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div>
        <p className="font-mono text-xs text-text-tertiary">{realCase.id}</p>
        <h1 className="text-xl font-semibold text-text-primary">Cross-evidence relationship mind map</h1>
        <p className="text-sm text-text-tertiary">
          One Cognition Engine synthesis across every exhibit&apos;s real analyzed text on this case (transcripts,
          translations, AI image descriptions, per-face notes, document text/summaries) — named entities, the
          relationships the text actually evidences between them, and a case-level narrative. Not automatic or
          live: run on demand, cached until you re-run it.
        </p>
      </div>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">{realCase.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <MindMapPanel
            caseId={realCase.id}
            sensitivityLevel={realCase.sensitivityLevel}
            cached={cached}
            exhibitsWithTextCount={aggregation.exhibits.length}
            totalEvidenceCount={aggregation.totalEvidenceCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
