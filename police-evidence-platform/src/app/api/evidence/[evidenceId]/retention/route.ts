import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";

/**
 * PATCH /api/evidence/:id/retention — sets the Evidence Vault's Phase C
 * retention/legal-hold flags (Docs/Plan for the feature). Case-agnostic
 * route (like cross-case-matches), reached from the Vault detail page, not
 * from a case page — retention is a property of the exhibit itself, not of
 * one case's view of it. Flags only: no disposal workflow reads these yet.
 */
const retentionSchema = z.object({
  legalHold: z.boolean().optional(),
  retentionUntil: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { evidenceId } = await params;

  const parsed = retentionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid retention update.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence) {
    return NextResponse.json({ error: "Evidence not found." }, { status: 404 });
  }

  const retentionUntil =
    parsed.data.retentionUntil === undefined
      ? undefined
      : parsed.data.retentionUntil === null
        ? null
        : new Date(parsed.data.retentionUntil);
  if (retentionUntil !== undefined && retentionUntil !== null && Number.isNaN(retentionUntil.getTime())) {
    return NextResponse.json({ error: "Invalid retentionUntil date." }, { status: 400 });
  }

  const updated = await db.evidence.update({
    where: { id: evidenceId },
    data: {
      ...(parsed.data.legalHold !== undefined ? { legalHold: parsed.data.legalHold } : {}),
      ...(retentionUntil !== undefined ? { retentionUntil } : {}),
    },
  });

  // Reuses "ASSIGNED" per this codebase's existing convention (see the
  // declarant/forensic-expert routes) rather than growing the action enum
  // for another single-purpose "an attribute was set on this exhibit" event.
  await writeAuditEntry({
    caseId: evidence.caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ASSIGNED",
    device: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ legalHold: updated.legalHold, retentionUntil: updated.retentionUntil });
}
