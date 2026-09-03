import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const addActorSchema = z.object({
  platform: z.string().min(1, "Platform is required."),
  handle: z.string().min(1, "Handle is required."),
  note: z.string().optional(),
});

/**
 * POST /api/investigations/:id/actors — tag a suspected handle/account
 * (Docs/Plan for the feature, Phase B). Any authenticated investigator,
 * not admin-only like case-linking: this is a working lead, not a
 * legal/FIR-consequential assertion. No AuditLogEntry — see the schema
 * comment on InvestigationActor for why (no single caseId this belongs to).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { investigationId } = await params;

  const parsed = addActorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid actor.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const investigation = await db.investigation.findUnique({ where: { id: investigationId } });
  if (!investigation) {
    return NextResponse.json({ error: "Investigation not found." }, { status: 404 });
  }

  const actor = await db.investigationActor.create({
    data: {
      investigationId,
      platform: parsed.data.platform,
      handle: parsed.data.handle,
      note: parsed.data.note || null,
      addedById: session.userId,
    },
  });

  return NextResponse.json(actor, { status: 201 });
}
