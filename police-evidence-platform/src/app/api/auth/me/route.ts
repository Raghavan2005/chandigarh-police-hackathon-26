import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ userId: session.userId, name: session.name, role: session.role });
}
