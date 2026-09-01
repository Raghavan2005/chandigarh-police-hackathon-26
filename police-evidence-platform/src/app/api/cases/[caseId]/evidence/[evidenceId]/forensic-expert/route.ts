import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";

/**
 * Records a real Part B — Cyber forensic expert authentication
 * (PS4_MVP_BUILD_PLAN.md §4) on an exhibit, once a court has actually
 * directed independent verification. Until this exists, the report
 * correctly shows "Part B — not applicable" rather than fabricating expert
 * content — this is the endpoint that makes that section genuinely real
 * instead of permanently unreachable.
 */
const forensicExpertSchema = z.object({
  name: z.string().min(1, "Expert name is required."),
  designation: z.string().min(1, "Designation is required."),
  labRef: z.string().min(1, "Laboratory reference is required."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;

  const parsed = forensicExpertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid forensic expert record.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const forensicExpert = await db.forensicExpert.upsert({
    where: { evidenceId },
    update: parsed.data,
    create: { evidenceId, ...parsed.data },
  });

  // No dedicated AuditAction for this — "ASSIGNED" already covers "someone
  // was attached to this case/evidence" (used for investigator assignment
  // at case creation), which fits a forensic expert being assigned to an
  // exhibit for verification just as well, without growing the enum for a
  // single new event type.
  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ASSIGNED",
    device: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(forensicExpert, { status: 201 });
}
