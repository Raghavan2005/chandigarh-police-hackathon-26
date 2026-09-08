import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getRealCase } from "@/lib/cases-server";
import { aggregateCaseText, buildStructuralGraph, collectLocationMentions } from "@/lib/mindmap-server";
import { MindMapPanel, type CachedCaseMindMap } from "@/components/mindmap/mindmap-panel";
import { PlaceMentionsBox } from "@/components/mindmap/place-mentions-box";

/**
 * Cross-evidence case graph (PS4_USE_CASES.md #6) — alongside the existing
 * History/Propagation/Report links on the case detail page. Real-case
 * only, deliberately no mock-data fallback: the old curated mock cases
 * (mock-data.ts) have no per-exhibit analysis rows to synthesize across
 * (no TranscriptResult/ImageDescriptionResult/etc — that data model didn't
 * exist yet when they were authored).
 *
 * The structural graph (buildStructuralGraph) is computed here, server-
 * side, on every page load — no LLM, no cost, always current — so the page
 * shows something genuinely real and useful immediately, before an
 * investigator ever clicks anything. The cached row (if one exists) holds
 * the fuller graph from the last AI-inferred-entity run, structural
 * snapshot included, per its own "as of <time>" staleness note.
 */
export default async function MindMapPage(props: PageProps<"/cases/[caseId]/mindmap">) {
  const { caseId } = await props.params;

  const realCase = await getRealCase(caseId);
  if (!realCase) notFound();

  const aggregation = aggregateCaseText(realCase);
  const structural = buildStructuralGraph(realCase);
  const locationMentions = collectLocationMentions(realCase);
  const cachedRow = await db.caseMindMap.findUnique({ where: { caseId } });
  const cached: CachedCaseMindMap | null = cachedRow
    ? {
        nodes: JSON.parse(cachedRow.nodesJson),
        edges: JSON.parse(cachedRow.edgesJson),
        summary: cachedRow.summary,
        exhibitCount: cachedRow.exhibitCount,
        ranAt: cachedRow.ranAt.toISOString(),
      }
    : null;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div>
        <p className="font-mono text-xs text-text-tertiary">{realCase.id}</p>
        <h1 className="text-xl font-semibold text-text-primary">Cross-evidence case graph</h1>
        <p className="text-sm text-text-tertiary">
          A real, always-current graph of this case&apos;s exhibits, their verdicts, and every corpus/cross-case/
          web-search match — plus an optional AI-inferred layer of named entities and text-evidenced relationships
          extracted from exhibit transcripts, descriptions, and notes. The structural half costs nothing and never
          leaves this platform; the AI half is run on demand and cached until you re-run it.
        </p>
      </div>

      {locationMentions.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-3 text-xs">
          <p className="flex items-center gap-1.5 font-medium text-text-secondary">
            <MapPin className="size-3.5 text-accent-primary" />
            Places mentioned across this case&apos;s evidence
          </p>
          <PlaceMentionsBox mentions={locationMentions} />
          <p className="text-[10px] text-text-tertiary">
            Real place names found in each exhibit&apos;s own text, tagged with who said it where known — drag any
            chip to rearrange, or click one to jump to that exhibit. Investigative leads to verify, not confirmed
            locations of any device or file.
          </p>
        </div>
      )}

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">{realCase.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <MindMapPanel
            caseId={realCase.id}
            sensitivityLevel={realCase.sensitivityLevel}
            cached={cached}
            structural={structural}
            exhibitsWithTextCount={aggregation.exhibits.length}
            totalEvidenceCount={aggregation.totalEvidenceCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
