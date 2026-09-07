import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { isImageDescriptionConfigured } from "@/lib/image-description";
import { fetchPageText, summarizeArticle } from "@/lib/news-summary";

/**
 * Real AI news-summary for a page a reverse-image search matched — keyed by
 * URL, not evidence, since the same matched page can surface from more than
 * one exhibit and there's no reason to re-fetch/re-summarize it each time.
 * Not case/evidence-scoped, but still requires auth like every other route:
 * the target is always a public page (never the evidence file itself), so
 * the only thing worth gating is who can trigger a billed Gemini call.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isImageDescriptionConfigured()) {
    return NextResponse.json(
      { error: "AI summarization isn't configured on this deployment (no Cognition Engine credentials set)." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : null;
  const force = body?.force === true;
  if (!url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url." }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Invalid url." }, { status: 400 });
  }

  if (!force) {
    const cached = await db.pageSummary.findUnique({ where: { url } });
    if (cached) {
      return NextResponse.json({
        isNewsArticle: cached.isNewsArticle,
        headline: cached.headline,
        outlet: cached.outlet,
        publishedDate: cached.publishedDate,
        summary: cached.summary,
        ranAt: cached.ranAt,
      });
    }
  }

  const pageText = await fetchPageText(url);
  if (!pageText) {
    return NextResponse.json(
      { error: "Could not fetch or read this page's content." },
      { status: 502 },
    );
  }

  const result = await summarizeArticle(url, pageText).catch((error: unknown) => {
    console.error("[page-summary] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json({ error: "Summarization failed." }, { status: 502 });
  }

  const saved = await db.pageSummary.upsert({
    where: { url },
    create: { url, ...result },
    update: { ...result, ranAt: new Date() },
  });

  return NextResponse.json({
    isNewsArticle: saved.isNewsArticle,
    headline: saved.headline,
    outlet: saved.outlet,
    publishedDate: saved.publishedDate,
    summary: saved.summary,
    ranAt: saved.ranAt,
  });
}
