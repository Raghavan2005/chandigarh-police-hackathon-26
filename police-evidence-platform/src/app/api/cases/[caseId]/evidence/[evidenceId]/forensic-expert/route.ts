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
 *
 * Also accepts `courtDirectionRef` on its own (Evidence.courtDirectionRef,
 * independent of the ForensicExpert row below): a real middle state
 * between "not applicable" and "expert findings recorded" — a court has
 * directed examination, but the expert's report hasn't arrived yet. Before
 * this, Part B could only ever be one of those two end states, which is
 * dishonest for a case genuinely awaiting a forwarded expert report.
 */
const forensicExpertSchema = z
  .object({
    courtDirectionRef: z.string().optional(),
    name: z.string().optional(),
    designation: z.string().optional(),
    labRef: z.string().optional(),
  })
  .refine((data) => data.courtDirectionRef || (data.name && data.designation && data.labRef), {
    message: "Provide either a court direction reference, or full expert details (name, designation, lab reference).",
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

  const { name, designation, labRef, courtDirectionRef } = parsed.data;

  let forensicExpert = null;
  if (name && designation && labRef) {
    forensicExpert = await db.forensicExpert.upsert({
      where: { evidenceId },
      update: { name, designation, labRef },
      create: { evidenceId, name, designation, labRef },
    });
  }
  if (courtDirectionRef !== undefined) {
    await db.evidence.update({ where: { id: evidenceId }, data: { courtDirectionRef: courtDirectionRef || null } });
  }

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

  return NextResponse.json({ forensicExpert, courtDirectionRef: courtDirectionRef ?? evidence.courtDirectionRef }, { status: 201 });
}
