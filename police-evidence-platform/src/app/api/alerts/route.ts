import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { listAlertsForUser } from "@/lib/alerts-server";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const alerts = await listAlertsForUser(session.userId, session.role);
  return NextResponse.json(alerts);
}
