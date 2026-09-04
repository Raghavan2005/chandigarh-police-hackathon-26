import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { getConfiguredWebSearchProviders } from "@/lib/web-search";
import { deriveSearchQuery, mergeWebSearchResults, type MergedWebSearchResult } from "@/lib/web-search-merge";
import { resolveDomainLocation } from "@/lib/domain-geo";
import { extractDocumentText } from "@/lib/document-analysis";

/**
 * Real multi-engine web search — Google (via Gemini grounding), Brave, and
 * DuckDuckGo, real merge/dedup, real domain-server geolocation. The query
 * defaults to this exhibit's own extracted text (transcript > document
 * text > AI description > reverse-image-search labels, whichever exists
 * first) but is always investigator-editable — a full transcript makes a
 * poor literal search query, this is a starting point, not a final answer.
 * Same NCII/minor gate as every other external-call route: the query text
 * (derived from evidence content) leaves the platform to three external
 * services.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      webSearchResult: true,
      transcriptResult: true,
      metadataResult: true,
      imageDescriptionResult: true,
      reverseImageSearchResults: true,
      case: { select: { sensitivityLevel: true } },
    },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  if (evidence.case.sensitivityLevel !== "standard") {
    return NextResponse.json(
      { error: "This evidence is flagged sensitive — sending its extracted text to external search engines is blocked to avoid exposing it outside this platform." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const overrideQuery = typeof body?.query === "string" && body.query.trim() ? body.query.trim() : null;

  const sourceText =
    overrideQuery ??
    (evidence.transcriptResult
      ? JSON.parse(evidence.transcriptResult.segmentsJson).map((s: { text: string }) => s.text).join(" ")
      : null) ??
    extractDocumentText(evidence.metadataResult?.exifJson) ??
    evidence.imageDescriptionResult?.description ??
    textFromReverseImageSearch(evidence.reverseImageSearchResults) ??
    null;

  if (!sourceText || !sourceText.trim()) {
    return NextResponse.json(
      { error: "No extracted text available to search with — run Investigate first (it generates captions/AI description/reverse-image labels automatically), or type a query above." },
      { status: 422 },
    );
  }
  const query = overrideQuery ?? deriveSearchQuery(sourceText);

  if (evidence.webSearchResult && evidence.webSearchResult.query === query) {
    return NextResponse.json(serializeWebSearch(evidence.webSearchResult));
  }

  const providers = getConfiguredWebSearchProviders();
  const perProviderResults = await Promise.all(
    providers.map(async (p) => {
      try {
        return { label: p.label, results: await p.run(query) };
      } catch (error: unknown) {
        console.error(`[web-search] ${p.label} failed:`, error);
        return { label: p.label, results: [] };
      }
    }),
  );

  const merged = mergeWebSearchResults(perProviderResults);
  if (merged.length === 0) {
    return NextResponse.json(
      { error: "No search providers returned results — they may be unreachable or rate-limited. Try again shortly." },
      { status: 502 },
    );
  }

  const uniqueDomains = [...new Set(merged.map((r) => r.domain).filter(Boolean))];
  const locationEntries = await Promise.all(
    uniqueDomains.map(async (domain) => [domain, await resolveDomainLocation(domain)] as const),
  );
  const locationByDomain = new Map(locationEntries);
  const withLocations: MergedWebSearchResult[] = merged.map((r) => ({
    ...r,
    location: locationByDomain.get(r.domain) ?? null,
  }));

  const saved = await db.webSearchResult.upsert({
    where: { evidenceId },
    create: {
      evidenceId,
      query,
      resultsJson: JSON.stringify(withLocations),
      providersRun: JSON.stringify(perProviderResults.map((p) => p.label)),
    },
    update: {
      query,
      resultsJson: JSON.stringify(withLocations),
      providersRun: JSON.stringify(perProviderResults.map((p) => p.label)),
      ranAt: new Date(),
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-web-search",
  });

  return NextResponse.json(serializeWebSearch(saved));
}

/** Last-resort query source: no transcript, no document text, no AI
 * description — but a reverse-image search may still have found Vision
 * labels/web-entity names for this image, which beats refusing to search at
 * all. Merges every provider's real labels into one deduped term list. */
function textFromReverseImageSearch(
  rows: { bestGuessLabelsJson: string; webEntitiesJson: string; labelsJson: string }[],
): string | null {
  const terms = new Set<string>();
  for (const row of rows) {
    try {
      for (const label of JSON.parse(row.bestGuessLabelsJson) as string[]) {
        if (label) terms.add(label);
      }
      for (const entity of JSON.parse(row.webEntitiesJson) as { description: string }[]) {
        if (entity.description) terms.add(entity.description);
      }
      for (const label of JSON.parse(row.labelsJson) as { description: string }[]) {
        if (label.description) terms.add(label.description);
      }
    } catch {
      // malformed row — skip it, other providers may still have usable terms
    }
  }
  return terms.size > 0 ? [...terms].join(", ") : null;
}

function serializeWebSearch(row: { query: string; resultsJson: string; providersRun: string; ranAt: Date }) {
  return {
    query: row.query,
    results: JSON.parse(row.resultsJson) as MergedWebSearchResult[],
    providersRun: JSON.parse(row.providersRun) as string[],
    ranAt: row.ranAt,
  };
}
