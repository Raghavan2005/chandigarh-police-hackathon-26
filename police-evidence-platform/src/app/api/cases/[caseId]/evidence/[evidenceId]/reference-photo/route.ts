import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Streams the reference face photo used by the most recent face-match run
 * against this exhibit (written by /reference-match) — 404s plainly if no
 * face-match has ever been run. */
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

  const latest = await db.referenceMatchResult.findFirst({
    where: { evidenceId, matchType: "face", referenceImagePath: { not: null } },
    orderBy: { ranAt: "desc" },
    select: { referenceImagePath: true },
  });
  if (!latest?.referenceImagePath) {
    return NextResponse.json({ error: "No reference face photo on file for this exhibit yet." }, { status: 404 });
  }

  const buffer = await readFile(resolveEvidencePath(latest.referenceImagePath));
  const ext = latest.referenceImagePath.split(".").pop()?.toLowerCase();
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" },
  });
}
