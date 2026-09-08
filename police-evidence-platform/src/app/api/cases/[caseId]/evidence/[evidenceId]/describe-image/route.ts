import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { resolveEvidencePath } from "@/lib/storage";
import { extractFrameAt } from "@/lib/frame-extract";
import { describeImage, isImageDescriptionConfigured } from "@/lib/image-description";

/**
 * Real AI image description (Vertex AI Gemini) — the one capability able
 * to name a recognizable person at all, since Cloud Vision (used for
 * reverse-image search) has no face/identity recognition feature. A
 * separate credential/cache from reverse-image search: different API,
 * different reliability profile (a model's best-effort visual judgment,
 * not web-index matching), always presented as an investigative lead, not
 * a verified identification — see PS4_BUILD_STATUS.md for why.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isImageDescriptionConfigured()) {
    return NextResponse.json(
      { error: "Image description isn't configured on this deployment (no GCP credentials set)." },
      { status: 501 },
    );
  }

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { detectionResult: true, metadataResult: true, case: { select: { sensitivityLevel: true } } },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  if (evidence.case.sensitivityLevel !== "standard") {
    return NextResponse.json(
      { error: "This evidence is flagged sensitive — sending it to an external service is blocked to avoid exposing it outside this platform." },
      { status: 403 },
    );
  }

  const isImage = evidence.mimeType.startsWith("image/");
  const isVideo = evidence.mimeType.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Image description is only available for image and video evidence." },
      { status: 422 },
    );
  }

  let imageBuffer: Buffer;
  let mimeType: string;
  if (isImage) {
    imageBuffer = await readFile(resolveEvidencePath(evidence.filePath));
    mimeType = evidence.mimeType;
  } else {
    // Same frame the classifier already flagged as worst-scoring, if we
    // have it — describing the frame the pipeline itself found most
    // suspicious, not an arbitrary one. Falls back to the midpoint.
    let timestampSeconds = 0.5;
    if (evidence.detectionResult?.frameScoresJson) {
      try {
        const scores: { timestampSeconds: number; probability: number }[] = JSON.parse(
          evidence.detectionResult.frameScoresJson,
        );
        if (scores.length > 0) {
          timestampSeconds = scores.reduce((max, s) => (s.probability > max.probability ? s : max)).timestampSeconds;
        }
      } catch {
        // fall through to the default midpoint timestamp
      }
    } else if (evidence.metadataResult?.duration) {
      const duration = parseFloat(evidence.metadataResult.duration);
      if (Number.isFinite(duration) && duration > 0) timestampSeconds = duration / 2;
    }
    try {
      imageBuffer = await extractFrameAt(resolveEvidencePath(evidence.filePath), timestampSeconds);
    } catch (error) {
      console.error("[describe-image] frame extraction failed:", error);
      return NextResponse.json(
        { error: "Could not extract a frame from this video to describe — it may have no video track (e.g. an audio recording saved in a video container)." },
        { status: 422 },
      );
    }
    mimeType = "image/jpeg";
  }

  const result = await describeImage(imageBuffer, mimeType).catch((error: unknown) => {
    console.error("[describe-image] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Image description failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const cached = await db.imageDescriptionResult.upsert({
    where: { evidenceId },
    create: {
      evidenceId,
      description: result.description,
      possibleIdentitiesJson: JSON.stringify(result.possibleIdentities),
    },
    update: {
      description: result.description,
      possibleIdentitiesJson: JSON.stringify(result.possibleIdentities),
      ranAt: new Date(),
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-gemini-describe",
  });

  return NextResponse.json({ ...result, ranAt: cached.ranAt });
}
