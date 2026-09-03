import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { nextInvestigationId } from "@/lib/investigation-id";

/**
 * GET/POST /api/investigations — the Investigations feature (Docs/Plan):
 * groups cases believed connected to the same real-world actor/campaign.
 * Creation is admin-only (same gate as the global audit log, §2) — there's
 * no dedicated "supervisor" role in the current two-role model, and
 * cross-case linking is exactly the kind of action that should require a
 * deliberate justification and a narrower sign-off than any investigator.
 * Reading the list, like Cases, uses the same flat-visibility model
 * already in use everywhere else in this app.
 */
const createInvestigationSchema = z.object({
  title: z.string().min(1, "Title is required."),
  summary: z.string().optional(),
  initialCaseIds: z.array(z.string().min(1)).min(1, "At least one case must be linked to start an investigation."),
  justification: z.string().min(1, "A justification for linking these cases is required."),
});

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const investigations = await db.investigation.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } }, cases: { where: { unlinkedAt: null } } },
  });
  return NextResponse.json(investigations);
}

export async function POST(request: NextRequest) {
  const session = await requireRole("admin");
  if (session instanceof NextResponse) return session;

  const parsed = createInvestigationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid investigation details.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const uniqueCaseIds = Array.from(new Set(data.initialCaseIds));
  const existingCases = await db.case.findMany({ where: { id: { in: uniqueCaseIds } }, select: { id: true } });
  if (existingCases.length !== uniqueCaseIds.length) {
    return NextResponse.json({ error: "One or more case IDs do not exist." }, { status: 400 });
  }

  const { investigation, auditEntries } = await db.$transaction(async (tx) => {
    const id = await nextInvestigationId(tx);
    const investigation = await tx.investigation.create({
      data: {
        id,
        title: data.title,
        summary: data.summary,
        createdById: session.userId,
      },
    });

    const auditEntries = [];
    for (const caseId of uniqueCaseIds) {
      await tx.investigationCase.create({
        data: {
          investigationId: investigation.id,
          caseId,
          justification: data.justification,
          linkedById: session.userId,
        },
      });
      // Reuses "ASSIGNED" per this codebase's existing convention (see the
      // declarant/forensic-expert/forwarding routes) rather than growing
      // the action enum for another single-purpose event — the rich
      // detail (which investigation, and why) lives on InvestigationCase
      // itself, same split already used for CustodyTransfer.
      auditEntries.push(
        await writeAuditEntryInTx(
          {
            caseId,
            actorId: session.userId,
            action: "ASSIGNED",
            device: request.headers.get("user-agent") ?? undefined,
          },
          tx,
        ),
      );
    }

    return { investigation, auditEntries };
  });

  for (const entry of auditEntries) {
    appendCheckpoint(entry);
  }

  return NextResponse.json(investigation, { status: 201 });
}
