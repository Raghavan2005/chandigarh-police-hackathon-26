import "server-only";
import { Type } from "@google/genai";
import { buildClient } from "@/lib/image-description";

export interface PageSummaryResult {
  isNewsArticle: boolean;
  headline: string | null;
  outlet: string | null;
  publishedDate: string | null;
  summary: string | null;
}

export interface CachedPageSummaryResult extends PageSummaryResult {
  ranAt: string;
}

const MAX_PAGE_TEXT_CHARS = 6000;

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/**
 * Fetches a matched page's actual public text content (not evidence — this
 * is the same kind of page anyone's browser would load) and strips it down
 * to plain text for a summarization prompt. No HTML-parsing dependency:
 * none is installed, and a full DOM parser is overkill for feeding a
 * summarization prompt — a regex strip is honest about being crude but
 * sufficient here. Returns null (never a partial/fake result) on a
 * non-200, timeout, or non-HTML response.
 */
export async function fetchPageText(url: string): Promise<string | null> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!response || !response.ok) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) return null;

  const html = await response.text().catch(() => null);
  if (!html) return null;

  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, " ");
  const decoded = withoutTags.replace(/&[a-z#0-9]+;/gi, (m) => ENTITY_MAP[m] ?? m);
  const collapsed = decoded.replace(/\s+/g, " ").trim();

  if (!collapsed) return null;
  return collapsed.slice(0, MAX_PAGE_TEXT_CHARS);
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isNewsArticle: {
      type: Type.BOOLEAN,
      description: "True only if this page is genuinely a news article (not a forum post, social media post, homepage, or unrelated content).",
    },
    headline: { type: Type.STRING, nullable: true },
    outlet: { type: Type.STRING, nullable: true, description: "The publication/outlet name, if identifiable." },
    publishedDate: { type: Type.STRING, nullable: true, description: "Publication date as stated on the page, if present." },
    summary: { type: Type.STRING, nullable: true, description: "Two to four plain, factual sentences summarizing the article's actual content." },
  },
  required: ["isNewsArticle", "headline", "outlet", "publishedDate", "summary"],
};

const PROMPT = `You are assisting a police investigator reviewing a web page that a reverse-image search matched. Judge for yourself, honestly, whether this page is actually a news article (not a forum post, social media post, product page, homepage, or unrelated content). If it is, extract its headline, outlet, published date (only if actually stated on the page), and write a short, factual, neutral summary of what it reports. If it is not a news article, or the content is too sparse/garbled to summarize confidently, set isNewsArticle to false and leave the other fields null — never fabricate a summary for a page you can't actually read.`;

/**
 * Real Gemini judgment of whether a matched page is news, and a real
 * summary from the real fetched text when it is — never inferred from the
 * URL alone. Same shared client (buildClient()) as image-description.ts.
 */
export async function summarizeArticle(url: string, pageText: string): Promise<PageSummaryResult> {
  const genAI = buildClient();
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\nURL: ${url}\n\nPage text:\n${pageText}` }] }],
    config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
  });

  const text = result.text;
  if (!text) throw new Error("Gemini returned no content.");

  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null || typeof (parsed as { isNewsArticle?: unknown }).isNewsArticle !== "boolean") {
    throw new Error("Gemini returned a malformed response.");
  }

  const raw = parsed as {
    isNewsArticle: boolean;
    headline: string | null;
    outlet: string | null;
    publishedDate: string | null;
    summary: string | null;
  };

  if (!raw.isNewsArticle) {
    return { isNewsArticle: false, headline: null, outlet: null, publishedDate: null, summary: null };
  }
  return {
    isNewsArticle: true,
    headline: raw.headline ?? null,
    outlet: raw.outlet ?? null,
    publishedDate: raw.publishedDate ?? null,
    summary: raw.summary ?? null,
  };
}
