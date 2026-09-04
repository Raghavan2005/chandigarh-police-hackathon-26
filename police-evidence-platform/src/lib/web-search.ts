import "server-only";
import { GoogleGenAI } from "@google/genai";

export interface WebSearchResultItem {
  title: string;
  url: string;
  domain: string;
  snippet: string | null;
}

export interface WebSearchProvider {
  id: string;
  label: string;
  isConfigured(): boolean;
  run(query: string): Promise<WebSearchResultItem[]>;
}

// A bare User-Agent alone wasn't enough — found live: DuckDuckGo's bot
// detection flagged requests missing standard browser Accept/Accept-Language
// headers even with a real browser User-Agent, returning a 202 stall page
// instead of results. Full realistic header set fixes it.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/**
 * Real Google Search results via Vertex AI Gemini's grounding tool
 * (@google/genai — the newer SDK; the older @google-cloud/vertexai client
 * used elsewhere only exposes a search-grounding tool incompatible with
 * the Gemini 2.x models this app uses, confirmed live in claim-verification.ts).
 * Reuses the same real grounding mechanism, just harvesting the citation
 * list instead of asking Gemini to write an answer.
 */
async function searchGoogleGrounded(query: string): Promise<WebSearchResultItem[]> {
  const projectId = process.env.GEMINI_GCP_PROJECT_ID;
  if (!projectId) throw new Error("GEMINI_GCP_PROJECT_ID is not set.");

  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: "us-central1",
    googleAuthOptions: { keyFilename: process.env.GEMINI_APPLICATION_CREDENTIALS },
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Search for: ${query}`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  return chunks
    .filter((c): c is typeof c & { web: NonNullable<typeof c.web> } => Boolean(c.web?.uri))
    .map((c) => ({
      title: c.web.title ?? c.web.domain ?? "Source",
      url: c.web.uri as string,
      domain: c.web.domain ?? domainFromUrl(c.web.uri as string),
      snippet: null, // grounding doesn't expose a snippet, only title/url
    }));
}

/**
 * Real DuckDuckGo results via their no-JS HTML endpoint — no API key, no
 * account, works today (verified live against this exact case's content
 * before wiring this in). Unofficial: DuckDuckGo has no public search API,
 * this is the same lightweight-html-endpoint technique already used
 * elsewhere in this codebase (news-summary.ts's fetchPageText) — could
 * break if they change their markup. Real result links are wrapped in a
 * DuckDuckGo redirect (`/l/?uddg=<encoded-real-url>`), which this decodes
 * to the actual target rather than linking through DuckDuckGo.
 */
async function searchDuckDuckGo(query: string): Promise<WebSearchResultItem[]> {
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const html = await response.text();

  const results: WebSearchResultItem[] = [];
  const titleRe = /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const snippetRe = /class="result__snippet"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;

  const snippetsByHref = new Map<string, string>();
  for (const m of html.matchAll(snippetRe)) {
    snippetsByHref.set(m[1], stripTags(m[2]));
  }

  for (const m of html.matchAll(titleRe)) {
    const rawHref = m[1];
    const title = stripTags(m[2]);
    const uddgMatch = rawHref.match(/[?&]uddg=([^&]+)/);
    if (!uddgMatch || !title) continue;
    const url = decodeURIComponent(uddgMatch[1]);
    results.push({ title, url, domain: domainFromUrl(url), snippet: snippetsByHref.get(rawHref) ?? null });
  }
  return results;
}

/**
 * Real Brave Search results via their public search page — same
 * no-key/unofficial technique as DuckDuckGo above (Brave's real Search API
 * requires a paid account this project doesn't have). Verified live before
 * wiring this in. Brave's markup uses Svelte-generated hash class names
 * that can drift between deployments — matched only on the stable
 * semantic prefix of each class (e.g. "search-snippet-title"), not the
 * trailing hash, to reduce (not eliminate) breakage risk.
 */
async function searchBrave(query: string): Promise<WebSearchResultItem[]> {
  const response = await fetch(`https://search.brave.com/search?q=${encodeURIComponent(query)}`, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const html = await response.text();

  const results: WebSearchResultItem[] = [];
  // Each real result's outer link: <a href="URL" target="_self" class="...l1">
  const blockRe = /<a href="(https?:\/\/[^"]+)" target="_self" class="[^"]*\bl1\b[^"]*"/g;
  const matches = [...html.matchAll(blockRe)];

  for (let i = 0; i < matches.length; i++) {
    const url = matches[i][1];
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? html.length) : Math.min(html.length, start + 4000);
    const block = html.slice(start, end);

    const titleMatch = block.match(/class="title search-snippet-title[^"]*"\s+title="([^"]*)"/);
    const snippetMatch = block.match(/class="content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (!titleMatch) continue;

    results.push({
      title: decodeHtmlEntities(titleMatch[1]),
      url,
      domain: domainFromUrl(url),
      snippet: snippetMatch ? stripTags(snippetMatch[1]) || null : null,
    });
  }
  return results;
}

function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_APPLICATION_CREDENTIALS && process.env.GEMINI_GCP_PROJECT_ID);
}

export const googleGroundedProvider: WebSearchProvider = {
  id: "google_grounded",
  label: "Google (Search grounding)",
  isConfigured: isGeminiConfigured,
  run: searchGoogleGrounded,
};

export const duckDuckGoProvider: WebSearchProvider = {
  id: "duckduckgo",
  label: "DuckDuckGo",
  isConfigured: () => true, // no key/account needed
  run: searchDuckDuckGo,
};

export const braveProvider: WebSearchProvider = {
  id: "brave",
  label: "Brave",
  isConfigured: () => true, // no key/account needed
  run: searchBrave,
};

/** Every provider actually usable in this deployment — the two
 * HTML-scrape providers are always "configured" (no credential needed);
 * the Gemini-grounded one only if Vertex AI credentials are set. Iterate
 * this rather than assuming which providers exist, so a future provider
 * (or one of these going away) doesn't need call-site changes. */
export function getConfiguredWebSearchProviders(): WebSearchProvider[] {
  return [googleGroundedProvider, braveProvider, duckDuckGoProvider].filter((p) => p.isConfigured());
}
