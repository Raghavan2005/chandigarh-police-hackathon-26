import type { WebSearchResult } from "@prisma/client";
import type { WebSearchResultItem } from "@/lib/web-search";
import type { DomainLocation } from "@/lib/domain-geo";
import type { CachedWebSearchResult } from "@/components/investigation/web-search-panel";

export interface MergedWebSearchResult extends WebSearchResultItem {
  foundBy: string[];
  location: DomainLocation | null;
}

/** Shared parse for the cached WebSearchResult row — kept in this
 * isomorphic module (no "use client"/"server-only") rather than in a
 * client component's file, since both a Server Component (source-finder-
 * tab.tsx) and client components read it; a plain function exported from a
 * "use client" module can't be called directly from a Server Component. */
export function parseWebSearchResult(row: WebSearchResult | null | undefined): CachedWebSearchResult | null {
  if (!row) return null;
  try {
    return {
      query: row.query,
      results: JSON.parse(row.resultsJson),
      providersRun: JSON.parse(row.providersRun),
      ranAt: row.ranAt.toISOString(),
    };
  } catch {
    return null;
  }
}

/** Real merge/dedup across every provider that actually ran — dedupes by
 * normalized URL and tags which provider(s) found each result, same
 * pattern as reverse-image-search-merge.ts. */
export function mergeWebSearchResults(
  perProvider: { label: string; results: WebSearchResultItem[] }[],
): (WebSearchResultItem & { foundBy: string[] })[] {
  const byUrl = new Map<string, WebSearchResultItem & { foundBy: string[] }>();
  for (const { label, results } of perProvider) {
    for (const r of results) {
      const key = r.url.trim().toLowerCase();
      const existing = byUrl.get(key);
      if (existing) {
        if (!existing.foundBy.includes(label)) existing.foundBy.push(label);
        if (!existing.snippet && r.snippet) existing.snippet = r.snippet;
      } else {
        byUrl.set(key, { ...r, foundBy: [label] });
      }
    }
  }
  return [...byUrl.values()];
}

const MAX_QUERY_LENGTH = 200;

/** A full transcript/document text blob makes a poor search-engine query
 * (too many terms, most engines AND everything together and return
 * nothing) — truncates to a search-engine-sized query, at the last whole
 * word rather than cutting mid-word. Always investigator-editable in the
 * UI, this is just a starting point. */
export function deriveSearchQuery(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= MAX_QUERY_LENGTH) return collapsed;
  const truncated = collapsed.slice(0, MAX_QUERY_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}
