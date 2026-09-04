import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { loadFaceCropBuffer } from "@/lib/face-annotation";
import { isReverseImageSearchConfigured, runReverseImageSearch } from "@/lib/reverse-image-search";

/**
 * Same real Cloud Vision Web Detection as the whole-exhibit reverse-image
 * search, run against one cropped face instead of the full frame — lets an
 * investigator search a specific person in a multi-person photo rather
 * than only ever searching the whole scene. Cached per (evidenceId,
 * faceIndex) in FaceAnnotation, same "as of &lt;time&gt;, always re-runnable"
 * pattern as the exhibit-level version.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string; faceIndex: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isReverseImageSearchConfigured()) {
    return NextResponse.json(
      { error: "Reverse-image search isn't configured on this deployment (no GCP credentials set)." },
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

  const result = await runReverseImageSearch(resolved.buffer).catch((error: unknown) => {
    console.error("[face reverse-image-search] Vision API call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Reverse-image search failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const ranAt = new Date();
  await db.faceAnnotation.upsert({
    where: { evidenceId_faceIndex: { evidenceId, faceIndex } },
    create: { evidenceId, faceIndex, reverseSearchJson: JSON.stringify(result), reverseSearchRanAt: ranAt },
    update: { reverseSearchJson: JSON.stringify(result), reverseSearchRanAt: ranAt },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: resolved.evidenceSha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-vision-api-face",
  });

  return NextResponse.json({ ...result, ranAt });
}
