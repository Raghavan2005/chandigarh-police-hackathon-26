import "server-only";

export type PageTimestampSource = "jsonld" | "meta" | "header";

export interface PageTimestamp {
  publishedAt: string; // ISO 8601
  source: PageTimestampSource;
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
};

// Only the first slice of the document is scanned — publish-date signals
// (meta tags, JSON-LD) live in <head> or right at the top of <body> on
// every real-world site checked; capping this bounds fetch/parse cost
// across dozens of results run in parallel per search.
const MAX_HTML_CHARS = 300_000;

const CURRENT_YEAR = new Date().getFullYear();

/** Rejects unparsable dates and obvious placeholders (epoch defaults, dates
 * before the web existed, dates in the future) — a wrong date is worse than
 * no date for an investigator building a timeline. */
function parseDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw.trim());
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  if (year < 1995 || year > CURRENT_YEAR + 1) return null;
  return d.toISOString();
}

/** Attribute-order-agnostic <meta> reader — real markup mixes
 * `property`/`content` ordering across sites, so this parses each tag's
 * attributes rather than assuming a fixed order. */
function extractMetaContent(html: string, keys: string[]): string | null {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const wanted = new Set(keys.map((k) => k.toLowerCase()));
  for (const tag of metaTags) {
    const keyMatch = tag.match(/(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i);
    const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
    if (!keyMatch || !contentMatch) continue;
    if (!wanted.has(keyMatch[1].toLowerCase())) continue;
    const date = parseDate(contentMatch[1]);
    if (date) return date;
  }
  return null;
}

function extractFromTimeTag(html: string): string | null {
  const match = html.match(/<time\b[^>]*\bdatetime\s*=\s*["']([^"']+)["']/i);
  return match ? parseDate(match[1]) : null;
}

/** schema.org NewsArticle/Article `datePublished` — the most explicit,
 * structured signal a publisher can give; most Indian and international
 * news CMSes emit this for SEO regardless of what the page visually shows. */
function extractFromJsonLd(html: string): string | null {
  const scripts = html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of scripts) {
    let data: unknown;
    try {
      data = JSON.parse(m[1].trim());
    } catch {
      continue; // malformed JSON-LD on this page — other sources may still work
    }
    const graph = Array.isArray(data) ? data : [data, ...(((data as { ["@graph"]?: unknown[] })?.["@graph"]) ?? [])];
    for (const node of graph) {
      if (!node || typeof node !== "object") continue;
      const n = node as { datePublished?: string; dateCreated?: string };
      const date = parseDate(n.datePublished) ?? parseDate(n.dateCreated);
      if (date) return date;
    }
  }
  return null;
}

/**
 * Real per-page "first seen" timestamp — fetches the actual result URL
 * (same as a browser would) and reads its own declared publish date,
 * instead of guessing. Priority: JSON-LD structured data (most explicit,
 * SEO-driven, present on most news CMSes) > <meta>/<time> tags > the HTTP
 * `Last-Modified` response header (weakest signal — many servers set it to
 * the last cache regeneration, not the true publish date). Returns null
 * (never fabricates a date) when none of these are present or parseable.
 */
export async function resolvePageTimestamp(url: string): Promise<PageTimestamp | null> {
  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(7000),
      redirect: "follow",
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const fullHtml = await response.text();
    const html = fullHtml.slice(0, MAX_HTML_CHARS);

    const jsonLd = extractFromJsonLd(html);
    if (jsonLd) return { publishedAt: jsonLd, source: "jsonld" };

    const meta =
      extractMetaContent(html, [
        "article:published_time",
        "og:published_time",
        "datepublished",
        "publish-date",
        "publishdate",
        "sailthru.date",
        "parsely-pub-date",
        "date",
      ]) ?? extractFromTimeTag(html);
    if (meta) return { publishedAt: meta, source: "meta" };

    const lastModified = parseDate(response.headers.get("last-modified"));
    if (lastModified) return { publishedAt: lastModified, source: "header" };

    return null;
  } catch {
    return null;
  }
}
