import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { loadFaceCropBuffer } from "@/lib/face-annotation";
import { describeImage, isImageDescriptionConfigured } from "@/lib/image-description";

/**
 * Same real Vertex AI Gemini description/possible-identity capability as
 * the whole-exhibit version, run against one cropped face — narrows the
 * model's attention to a single person in a multi-person photo instead of
 * describing the whole scene. Cached per (evidenceId, faceIndex) in
 * FaceAnnotation, same caching pattern as the exhibit-level version.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string; faceIndex: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isImageDescriptionConfigured()) {
    return NextResponse.json(
      { error: "Image description isn't configured on this deployment (no GCP credentials set)." },
      { status: 501 },
    );
  }

  const { caseId, evidenceId, faceIndex: faceIndexParam } = await params;
  const faceIndex = Number.parseInt(faceIndexParam, 10);

  const resolved = await loadFaceCropBuffer(caseId, evidenceId, faceIndex);
  if (!resolved) {
    return NextResponse.json({ error: "No detected face at that index for this evidence." }, { status: 404 });
  }

  if (resolved.sensitivityLevel !== "standard") {
    return NextResponse.json(
      { error: "This evidence is flagged sensitive — sending it to an external service is blocked to avoid exposing it outside this platform." },
      { status: 403 },
    );
  }

  const result = await describeImage(resolved.buffer, "image/png").catch((error: unknown) => {
    console.error("[face describe-image] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Image description failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const ranAt = new Date();
  await db.faceAnnotation.upsert({
    where: { evidenceId_faceIndex: { evidenceId, faceIndex } },
    create: { evidenceId, faceIndex, descriptionJson: JSON.stringify(result), descriptionRanAt: ranAt },
    update: { descriptionJson: JSON.stringify(result), descriptionRanAt: ranAt },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: resolved.evidenceSha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-gemini-describe-face",
  });

  return NextResponse.json({ ...result, ranAt });
}
