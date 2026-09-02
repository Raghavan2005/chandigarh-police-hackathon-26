import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

/**
 * Authenticated — only a logged-in investigator's New Case tab should see
 * that a photo is waiting, even though anyone could have submitted it (see
 * the POST route's comment). Returns the single most recent unconsumed
 * capture, polled from the wizard every few seconds.
 */
export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const latest = await db.pendingCapture.findFirst({
    where: { consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return NextResponse.json({ pending: null });
  }

  return NextResponse.json({
    pending: { id: latest.id, mimeType: latest.mimeType, createdAt: latest.createdAt },
  });
}
