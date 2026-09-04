import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

/**
 * Server-side fetch of a real reverse-image-search result thumbnail — a
 * fallback for the real minority of hosts that block direct browser
 * hotlinking (referrer/CORS checks that a same-origin server request
 * doesn't trigger the same way). Not an open proxy: `url` must be one of
 * the URLs already present in this exact evidence item's own persisted
 * `ReverseImageSearchResult` row (a real result Google's own API already
 * returned, not anything a client could ask us to fetch), which is what
 * keeps this from being an SSRF hole.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  }

  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const cached = await db.reverseImageSearchResult.findMany({ where: { evidenceId } });
  if (cached.length === 0) {
    return NextResponse.json({ error: "No reverse-image search result on file for this exhibit." }, { status: 404 });
  }

  const allowedUrls = new Set<string>(
    cached.flatMap((row) => [
      ...(JSON.parse(row.fullMatchesJson) as string[]),
      ...(JSON.parse(row.partialMatchesJson) as string[]),
    ]),
  );
  if (!allowedUrls.has(url)) {
    return NextResponse.json({ error: "URL is not part of this exhibit's recorded search result." }, { status: 403 });
  }

  const upstream = await fetch(url, {
    headers: {
      // A real browser-like UA and no referrer — this is what actually
      // lets through hosts that specifically block requests carrying our
      // own domain as the referrer, without impersonating anything the
      // request isn't (it's a genuine server-side fetch, not spoofed).
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Could not fetch the image from its source." }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Source did not return an image." }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      // Real external content, immutable once fetched — safe to cache in
      // the browser so re-opening the case doesn't re-proxy every image.
      "Cache-Control": "private, max-age=86400",
    },
  });
}
