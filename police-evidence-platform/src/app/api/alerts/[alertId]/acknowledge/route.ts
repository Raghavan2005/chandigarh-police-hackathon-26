import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

/**
 * POST /api/alerts/:id/acknowledge — soft state change, not deletion, same
 * append-only-history pattern as everything else accountability-adjacent
 * in this app (custody transfers, investigation links). Only the alert's
 * own visibility rule (its target user, or any admin for a platform-wide
 * one) may acknowledge it — the same rule listAlertsForUser applies when
 * showing the list, so nobody can acknowledge an alert they couldn't see.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ alertId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { alertId } = await params;

  const alert = await db.alert.findUnique({ where: { id: alertId } });
  if (!alert) {
    return NextResponse.json({ error: "Alert not found." }, { status: 404 });
  }

  const canAcknowledge =
    alert.targetUserId === session.userId || (alert.targetUserId === null && session.role === "admin");
  if (!canAcknowledge) {
    return NextResponse.json({ error: "You cannot acknowledge this alert." }, { status: 403 });
  }
  if (alert.acknowledgedAt) {
    return NextResponse.json({ error: "This alert has already been acknowledged." }, { status: 409 });
  }

  const updated = await db.alert.update({
    where: { id: alertId },
    data: { acknowledgedById: session.userId, acknowledgedAt: new Date() },
  });

  return NextResponse.json(updated);
}
