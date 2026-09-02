import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

/** Authenticated — marks a pending capture used so it isn't offered to a second tab or on reload. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const pending = await db.pendingCapture.findUnique({ where: { id } });
  if (!pending) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await db.pendingCapture.update({ where: { id }, data: { consumedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
