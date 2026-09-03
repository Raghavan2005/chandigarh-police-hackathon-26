import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";

const unlinkSchema = z.object({
  unlinkReason: z.string().min(1, "A reason for unlinking this case is required."),
});

/**
 * DELETE /api/investigations/:id/cases/:caseId — soft-unlink. Sets
 * unlinkedAt/unlinkedById/unlinkReason rather than deleting the
 * InvestigationCase row, so the fact this link once existed (and why it
 * was removed) stays on record — same reasoning as the audit log being
 * append-only and evidence never being deleted.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string; caseId: string }> },
) {
  const session = await requireRole("admin");
  if (session instanceof NextResponse) return session;

  const { investigationId, caseId } = await params;

  const parsed = unlinkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid unlink request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const activeLink = await db.investigationCase.findFirst({
    where: { investigationId, caseId, unlinkedAt: null },
  });
  if (!activeLink) {
    return NextResponse.json({ error: "No active link found for this case on this investigation." }, { status: 404 });
  }

  const { link, auditEntry } = await db.$transaction(async (tx) => {
    const link = await tx.investigationCase.update({
      where: { id: activeLink.id },
      data: {
        unlinkedById: session.userId,
        unlinkedAt: new Date(),
        unlinkReason: parsed.data.unlinkReason,
      },
    });
    const auditEntry = await writeAuditEntryInTx(
      {
        caseId,
        actorId: session.userId,
        action: "ASSIGNED",
        device: request.headers.get("user-agent") ?? undefined,
      },
      tx,
    );
    return { link, auditEntry };
  });

  appendCheckpoint(auditEntry);

  return NextResponse.json(link);
}
