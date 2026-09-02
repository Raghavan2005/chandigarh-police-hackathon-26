import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";

/**
 * Records a real superior-officer forwarding/countersigning endorsement on
 * a case (officer-review finding: a report signed only by the preparing IO
 * has no forwarding-through-channel record, unlike every real report sent
 * to a court). Free-text fields, not a User relation — the forwarding
 * officer is very often not a Pramana platform account holder.
 */
const forwardingSchema = z.object({
  forwardingOfficerName: z.string().min(1, "Forwarding officer name is required."),
  forwardingOfficerRank: z.string().min(1, "Forwarding officer rank is required."),
  forwardingOfficerBadgeNo: z.string().optional(),
  forwardingRemarks: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId } = await params;

  const parsed = forwardingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid forwarding endorsement.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const caseRecord = await db.case.findUnique({ where: { id: caseId } });
  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const updated = await db.case.update({
    where: { id: caseId },
    data: {
      forwardingOfficerName: parsed.data.forwardingOfficerName,
      forwardingOfficerRank: parsed.data.forwardingOfficerRank,
      forwardingOfficerBadgeNo: parsed.data.forwardingOfficerBadgeNo || null,
      forwardingRemarks: parsed.data.forwardingRemarks || null,
      forwardedAt: new Date(),
    },
  });

  // Reuses "ASSIGNED" per this codebase's existing convention (see the
  // forensic-expert route's own comment) rather than growing the enum for
  // a single new "someone was attached" event type.
  await writeAuditEntry({
    caseId,
    actorId: session.userId,
    action: "ASSIGNED",
    device: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(updated, { status: 200 });
}
