import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/**
 * Streams the actual evidence file — nothing under storage/ is in public/,
 * so there was previously no way to view the raw uploaded media at all,
 * only metadata about it. Auth-gated like every other case route; no
 * caching headers, since evidence access should always go through this
 * check, not sit in a browser/CDN cache.
 *
 * Real HTTP Range support (RFC 7233) — without `Accept-Ranges`/`206`
 * responses, browsers (and video player libraries explicitly, e.g.
 * Vidstack) treat the stream as non-seekable and reset any seek attempt
 * back to 0. Found live, not by inspection: every frame-step/timeline-jump
 * silently snapped back to the start because this route always returned
 * the whole file as one unseekable `200`, even when a `Range` header was
 * sent — confirmed with a direct `curl -H "Range: ..."` request coming
 * back `200` instead of `206`.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const absolutePath = resolveEvidencePath(evidence.filePath);
  const { size } = await stat(absolutePath);

  const rangeHeader = request.headers.get("range");
  if (!rangeHeader) {
    const stream = Readable.toWeb(createReadStream(absolutePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": evidence.mimeType,
        "Content-Disposition": "inline",
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store",
      },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match || (!match[1] && !match[2])) {
    return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  const start = match[1] ? parseInt(match[1], 10) : Math.max(0, size - parseInt(match[2], 10));
  const end = match[1] && match[2] ? Math.min(parseInt(match[2], 10), size - 1) : size - 1;
  if (start > end || start >= size) {
    return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }

  const chunkSize = end - start + 1;
  const stream = Readable.toWeb(createReadStream(absolutePath, { start, end })) as ReadableStream;
  return new NextResponse(stream, {
    status: 206,
    headers: {
      "Content-Type": evidence.mimeType,
      "Content-Disposition": "inline",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(chunkSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
    },
  });
}
