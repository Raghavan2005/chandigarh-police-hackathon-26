import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/**
 * Streams the actual evidence file — nothing under storage/ is in public/,
 * so there was previously no way to view the raw uploaded media at all,
 * only metadata about it. Auth-gated like every other case route; no
 * caching headers, since evidence access should always go through this
 * check, not sit in a browser/CDN cache.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const buffer = await readFile(resolveEvidencePath(evidence.filePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": evidence.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
