import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { loadFaceCropBuffer } from "@/lib/face-annotation";

/**
 * Sets a manual investigator label on one detected face — e.g. "Suspect 1"
 * or a name once identified — separate from anything the model itself
 * claims. Reuses the ASSIGNED audit action, same as ForensicExpertDialog/
 * DeclarantDialog, rather than growing the action enum for one more
 * human-entered-data event.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string; faceIndex: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId, faceIndex: faceIndexParam } = await params;
  const faceIndex = Number.parseInt(faceIndexParam, 10);

  const resolved = await loadFaceCropBuffer(caseId, evidenceId, faceIndex);
  if (!resolved) {
    return NextResponse.json({ error: "No detected face at that index for this evidence." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim().slice(0, 200) : "";

  const annotation = await db.faceAnnotation.upsert({
    where: { evidenceId_faceIndex: { evidenceId, faceIndex } },
    create: { evidenceId, faceIndex, label: label || null },
    update: { label: label || null },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: resolved.evidenceSha256,
    actorId: session.userId,
    action: "ASSIGNED",
    device: "pramana-face-label",
  });

  return NextResponse.json({ label: annotation.label });
}
