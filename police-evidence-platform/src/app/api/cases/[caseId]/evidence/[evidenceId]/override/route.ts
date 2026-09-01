import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";

/**
 * Human-in-the-loop verdict override (PS4_MVP_BUILD_PLAN.md §1 item 9, §5).
 * Evidence-level, not case-level — a case can hold multiple Evidence rows,
 * each with its own FusionVerdict, and VerdictOverride/FusionVerdict both
 * key off evidenceId in the schema, not caseId. Closes the gap the officer
 * review flagged: the current UI (`case-meta-panel.tsx`) only updates local
 * dialog state and never survives a page refresh.
 */

const overrideSchema = z.object({
  newVerdict: z.enum(["AUTHENTIC", "MANIPULATED", "AI_GENERATED", "INCONCLUSIVE"]),
  reason: z.string().min(1, "A reason is required for every verdict override."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;

  const parsed = overrideSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid override request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { newVerdict, reason } = parsed.data;

  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { fusionVerdict: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  // Nothing to override if Evidence Fusion hasn't run yet — very possible
  // right now if Phase 2's fusion engine isn't wired up for this evidence.
  // An override is a correction to a computed verdict, not a substitute for
  // one, so this is a hard 409, not a silent no-op or a fabricated verdict.
  if (!evidence.fusionVerdict) {
    return NextResponse.json(
      { error: "Cannot override a verdict that hasn't been computed yet." },
      { status: 409 },
    );
  }

  const previousVerdict = evidence.fusionVerdict.verdict;

  const { override, auditEntry, fusionVerdict } = await db.$transaction(async (tx) => {
    const override = await tx.verdictOverride.create({
      data: {
        evidenceId,
        overriddenById: session.userId,
        previousVerdict,
        newVerdict,
        reason,
      },
    });

    // The override history lives in VerdictOverride regardless of what
    // happens next — this update just makes subsequent reads of
    // FusionVerdict reflect the human correction instead of the stale
    // machine-computed value.
    const fusionVerdict = await tx.fusionVerdict.update({
      where: { evidenceId },
      data: { verdict: newVerdict },
    });

    const auditEntry = await writeAuditEntryInTx(
      {
        caseId,
        evidenceHash: evidence.sha256,
        actorId: session.userId,
        action: "OVERRIDDEN",
        device: request.headers.get("user-agent") ?? undefined,
      },
      tx,
    );

    return { override, auditEntry, fusionVerdict };
  });

  appendCheckpoint(auditEntry);

  return NextResponse.json({ override, fusionVerdict }, { status: 201 });
}
