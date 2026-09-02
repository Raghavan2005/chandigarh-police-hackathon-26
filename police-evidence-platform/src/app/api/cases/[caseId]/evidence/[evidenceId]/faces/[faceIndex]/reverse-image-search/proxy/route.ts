import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

/**
 * Same server-side thumbnail-fetch fallback as the exhibit-level proxy
 * (some hosts block direct browser hotlinking), scoped to one face's own
 * cached search result. Not an open proxy: `url` must be one of the URLs
 * already present in this exact (evidenceId, faceIndex)'s persisted
 * `FaceAnnotation.reverseSearchJson` — a real result Google's own API
 * already returned for this face, not anything a client could ask us to
 * fetch — which is what keeps this from being an SSRF hole. Also rejects
 * anything the upstream host doesn't actually serve back as an image
 * (real content-type check, not just trusting the file extension).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string; faceIndex: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId, faceIndex: faceIndexParam } = await params;
  const faceIndex = Number.parseInt(faceIndexParam, 10);
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  }

  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const annotation = await db.faceAnnotation.findUnique({
    where: { evidenceId_faceIndex: { evidenceId, faceIndex } },
  });
  if (!annotation?.reverseSearchJson) {
    return NextResponse.json({ error: "No reverse-image search result on file for this face." }, { status: 404 });
  }

  const cached: { fullMatches: string[]; partialMatches: string[] } = JSON.parse(annotation.reverseSearchJson);
  const allowedUrls = new Set<string>([...cached.fullMatches, ...cached.partialMatches]);
  if (!allowedUrls.has(url)) {
    return NextResponse.json({ error: "URL is not part of this face's recorded search result." }, { status: 403 });
  }

  const upstream = await fetch(url, {
    headers: {
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
      "Cache-Control": "private, max-age=86400",
    },
  });
}
