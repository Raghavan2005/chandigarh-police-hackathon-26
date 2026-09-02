import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { resolveEvidencePath } from "@/lib/storage";

/** Authenticated — raw bytes for the New Case wizard to build a File object from. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const pending = await db.pendingCapture.findUnique({ where: { id } });
  if (!pending) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const buffer = await readFile(resolveEvidencePath(pending.filePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": pending.mimeType, "Cache-Control": "private, no-store" },
  });
}
