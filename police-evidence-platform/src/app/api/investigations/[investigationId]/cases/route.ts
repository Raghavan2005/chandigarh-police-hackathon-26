import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";

const linkCaseSchema = z.object({
  caseId: z.string().min(1),
  justification: z.string().min(1, "A justification for linking this case is required."),
});

/**
 * POST /api/investigations/:id/cases — link one additional case into an
 * existing investigation. Admin-only, same gate as creating an
 * investigation (§ above). Blocks re-linking a case that's already
 * actively linked (the @@unique([investigationId, caseId]) constraint
 * would reject it anyway, but a previously unlinked-then-relinked case is
 * a real, allowed scenario — a soft-unlinked row's caseId is still
 * present, so this checks unlinkedAt explicitly rather than trusting the
 * DB constraint to explain the difference).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const session = await requireRole("admin");
  if (session instanceof NextResponse) return session;

  const { investigationId } = await params;

  const parsed = linkCaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid case link.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const investigation = await db.investigation.findUnique({ where: { id: investigationId } });
  if (!investigation) {
    return NextResponse.json({ error: "Investigation not found." }, { status: 404 });
  }
  const caseRecord = await db.case.findUnique({ where: { id: parsed.data.caseId } });
  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const existingActiveLink = await db.investigationCase.findFirst({
    where: { investigationId, caseId: parsed.data.caseId, unlinkedAt: null },
  });
  if (existingActiveLink) {
    return NextResponse.json({ error: "This case is already linked to this investigation." }, { status: 409 });
  }

  const { link, auditEntry } = await db.$transaction(async (tx) => {
    const link = await tx.investigationCase.create({
      data: {
        investigationId,
        caseId: parsed.data.caseId,
        justification: parsed.data.justification,
        linkedById: session.userId,
      },
    });
    const auditEntry = await writeAuditEntryInTx(
      {
        caseId: parsed.data.caseId,
        actorId: session.userId,
        action: "ASSIGNED",
        device: request.headers.get("user-agent") ?? undefined,
      },
      tx,
    );
    return { link, auditEntry };
  });

  appendCheckpoint(auditEntry);

  return NextResponse.json(link, { status: 201 });
}
