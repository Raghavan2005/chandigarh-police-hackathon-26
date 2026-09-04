import type { ReverseImageSearchResult } from "@/lib/reverse-image-search";

export interface MergedMatch {
  url: string;
  foundBy: string[];
}

export interface MergedReverseImageSearchResult {
  fullMatches: MergedMatch[];
  partialMatches: MergedMatch[];
  pagesWithMatches: (MergedMatch & { pageTitle: string | null })[];
  webEntities: { description: string; score: number }[];
  bestGuessLabels: string[];
  labels: { description: string; score: number }[];
  /** Which providers actually ran and contributed to this merged result —
   * attribution for the search as a whole, not per-match. */
  providersRun: string[];
}

/** What the API route actually returns — the merged result plus when the
 * most recent contributing provider actually ran, so the UI can honestly
 * show "as of <time>" instead of implying a cached result is live. */
export interface CachedMergedReverseImageSearchResult extends MergedReverseImageSearchResult {
  ranAt: string;
}

function normalizeUrl(url: string): string {
  return url.trim().toLowerCase();
}

function mergeUrlLists(perProvider: { provider: string; urls: string[] }[]): MergedMatch[] {
  const byUrl = new Map<string, MergedMatch>();
  for (const { provider, urls } of perProvider) {
    for (const url of urls) {
      const key = normalizeUrl(url);
      const existing = byUrl.get(key);
      if (existing) {
        if (!existing.foundBy.includes(provider)) existing.foundBy.push(provider);
      } else {
        byUrl.set(key, { url, foundBy: [provider] });
      }
    }
  }
  return [...byUrl.values()];
}

/** Real merge/dedup across every provider that actually ran — dedupes
 * matches by URL and tags which provider(s) found each one. Works with
 * exactly one provider today (all `foundBy` arrays will read
 * `["Google Vision"]`); this is the same code path a second provider would
 * flow through once one exists, not a placeholder for it. */
export function mergeReverseImageSearchResults(
  perProvider: { provider: string; label: string; result: ReverseImageSearchResult }[],
): MergedReverseImageSearchResult {
  const fullMatches = mergeUrlLists(perProvider.map((p) => ({ provider: p.label, urls: p.result.fullMatches })));
  const partialMatches = mergeUrlLists(
    perProvider.map((p) => ({ provider: p.label, urls: p.result.partialMatches })),
  );

  const pagesByUrl = new Map<string, MergedMatch & { pageTitle: string | null }>();
  for (const { label, result } of perProvider) {
    for (const page of result.pagesWithMatches) {
      const key = normalizeUrl(page.url);
      const existing = pagesByUrl.get(key);
      if (existing) {
        if (!existing.foundBy.includes(label)) existing.foundBy.push(label);
        if (!existing.pageTitle && page.pageTitle) existing.pageTitle = page.pageTitle;
      } else {
        pagesByUrl.set(key, { url: page.url, pageTitle: page.pageTitle, foundBy: [label] });
      }
    }
  }

  const webEntitiesByDescription = new Map<string, number>();
  const labelsByDescription = new Map<string, number>();
  for (const { result } of perProvider) {
    for (const e of result.webEntities) {
      webEntitiesByDescription.set(e.description, Math.max(webEntitiesByDescription.get(e.description) ?? 0, e.score));
    }
    for (const l of result.labels) {
      labelsByDescription.set(l.description, Math.max(labelsByDescription.get(l.description) ?? 0, l.score));
    }
  }

  const bestGuessLabels = [...new Set(perProvider.flatMap((p) => p.result.bestGuessLabels))];

  return {
    fullMatches,
    partialMatches,
    pagesWithMatches: [...pagesByUrl.values()],
    webEntities: [...webEntitiesByDescription.entries()]
      .map(([description, score]) => ({ description, score }))
      .sort((a, b) => b.score - a.score),
    labels: [...labelsByDescription.entries()]
      .map(([description, score]) => ({ description, score }))
      .sort((a, b) => b.score - a.score),
    bestGuessLabels,
    providersRun: perProvider.map((p) => p.label),
  };
}
