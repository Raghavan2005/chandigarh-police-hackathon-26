import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const removeActorSchema = z.object({
  removeReason: z.string().min(1, "A reason for removing this actor is required."),
});

/**
 * DELETE /api/investigations/:id/actors/:actorId — soft-removes a
 * suspected-handle entry (Docs/Plan for the feature, Phase B). Sets
 * removedAt/removedById/removeReason rather than deleting the row, same
 * append-only-history pattern used for case links.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string; actorId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { investigationId, actorId } = await params;

  const parsed = removeActorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid removal request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const actor = await db.investigationActor.findUnique({ where: { id: actorId } });
  if (!actor || actor.investigationId !== investigationId) {
    return NextResponse.json({ error: "Actor not found on this investigation." }, { status: 404 });
  }
  if (actor.removedAt) {
    return NextResponse.json({ error: "This actor has already been removed." }, { status: 409 });
  }

  const updated = await db.investigationActor.update({
    where: { id: actorId },
    data: {
      removedById: session.userId,
      removedAt: new Date(),
      removeReason: parsed.data.removeReason,
    },
  });

  return NextResponse.json(updated);
}
