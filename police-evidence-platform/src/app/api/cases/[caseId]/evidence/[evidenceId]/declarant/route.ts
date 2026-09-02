import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";

/**
 * Records the real Section 63/65B Part A declarant for an exhibit — the
 * person who "was regularly using the device in the ordinary course of the
 * stated activity," which the certificate previously always assumed was
 * the investigating officer. That's frequently legally wrong (the
 * declarant should often be the complainant, or a platform/service
 * provider's authorized signatory), and there was no way to record anyone
 * else. Leaving this unset preserves the previous behavior — the report
 * falls back to the case's investigator.
 */
const declarantSchema = z.object({
  declarantName: z.string().min(1, "Declarant name is required."),
  declarantRole: z.string().min(1, "Declarant role is required."),
  declarantOrg: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;

  const parsed = declarantSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid declarant record.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const updated = await db.evidence.update({
    where: { id: evidenceId },
    data: {
      declarantName: parsed.data.declarantName,
      declarantRole: parsed.data.declarantRole,
      declarantOrg: parsed.data.declarantOrg || null,
    },
  });

  // Reuses "ASSIGNED" per this codebase's existing convention (see the
  // forensic-expert route) rather than growing the enum for another
  // single-purpose "someone was attached to this exhibit" event.
  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ASSIGNED",
    device: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(updated, { status: 200 });
}
