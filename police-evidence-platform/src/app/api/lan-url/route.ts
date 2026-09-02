import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getLanOrigin } from "@/lib/server-url";

/** Authenticated — tells the New Case wizard's tablet-capture QR/link which origin to encode. */
export async function GET(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  return NextResponse.json({ origin: getLanOrigin(request) });
}
