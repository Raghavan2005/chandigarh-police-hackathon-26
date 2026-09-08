import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { writeReferencePhoto, deleteReferencePhoto } from "@/lib/storage";
import { embedFace } from "@/lib/ml-client";
import { cosineSimilarity, FACE_MATCH_THRESHOLD } from "@/lib/face-match";
import { plateSimilarity, PLATE_MATCH_THRESHOLD } from "@/lib/plate-match";

interface MatchRow {
  frameIndex: number;
  timestampSeconds: number;
  similarity: number;
  boundingBoxJson: string | null;
}

/**
 * Real reference-face/plate matching against an already-detected CCTV
 * video's sampled frames (PS4_USE_CASES.md item #1) — "the investigator
 * can then upload a reference (a face or a plate) and get it matched
 * against what's in the footage." Two independent, real mechanisms:
 *
 * - face: embeds the uploaded reference photo (same real facenet_pytorch/
 *   VGGFace2 model as every sampled frame, ml-service/detector.py's
 *   embed_faces) and cosine-compares it against every CctvFrameFace row
 *   already computed by /detect-cctv — a similarity score against a
 *   stated threshold (face-match.ts), never a certified biometric
 *   identification.
 * - plate: fuzzy string-matches the investigator's typed plate against
 *   every VideoObjectDetection.plateText already OCR'd by /detect-cctv
 *   (plate-match.ts) — a real edit-distance similarity, never exact-only.
 *
 * Never fabricates a match: an empty result is an honest "not found in
 * this footage," and every returned row carries its real similarity score.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  if (!evidence.mimeType.startsWith("video/")) {
    return NextResponse.json({ error: "Reference matching is only available for video evidence." }, { status: 422 });
  }

  const frameSampleCount = await db.cctvFrameSample.count({ where: { evidenceId } });
  if (frameSampleCount === 0) {
    return NextResponse.json(
      { error: "Run CCTV object/plate/face detection on this video first — no sampled frames available to match against yet." },
      { status: 422 },
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }
  const matchType = formData.get("matchType");

  if (matchType === "plate") {
    return handlePlateMatch(formData, caseId, evidenceId, evidence.sha256, session.userId);
  }
  if (matchType === "face") {
    return handleFaceMatch(formData, caseId, evidenceId, evidence.sha256, session.userId);
  }
  return NextResponse.json({ error: "matchType must be 'face' or 'plate'." }, { status: 400 });
}

async function handlePlateMatch(
  formData: FormData,
  caseId: string,
  evidenceId: string,
  evidenceHash: string,
  actorId: string,
) {
  const rawPlateText = formData.get("plateText");
  const plateText = typeof rawPlateText === "string" ? rawPlateText.trim() : "";
  if (!plateText) {
    return NextResponse.json({ error: "Enter a reference plate string to match." }, { status: 400 });
  }

  const detections = await db.videoObjectDetection.findMany({
    where: { evidenceId, plateText: { not: null } },
    select: {
      plateText: true,
      boundingBoxJson: true,
      plateBoundingBoxJson: true,
      frameSample: { select: { frameIndex: true, timestampSeconds: true } },
    },
  });

  const matches: MatchRow[] = detections
    .map((d) => ({
      frameIndex: d.frameSample.frameIndex,
      timestampSeconds: d.frameSample.timestampSeconds,
      similarity: plateSimilarity(plateText, d.plateText!),
      // The plate's own box, when this detection has one (a fresh re-run
      // of /detect-cctv after this field was added) -- highlights the
      // plate itself rather than the whole vehicle. Older rows from before
      // plateBoundingBoxJson existed fall back to the vehicle box, same as
      // this feature behaved previously, rather than showing no box at all.
      boundingBoxJson: d.plateBoundingBoxJson ?? d.boundingBoxJson,
    }))
    .filter((m) => m.similarity >= PLATE_MATCH_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity);

  await db.referenceMatchResult.deleteMany({ where: { evidenceId, matchType: "plate" } });
  if (matches.length > 0) {
    await db.referenceMatchResult.createMany({
      data: matches.map((m) => ({
        evidenceId,
        matchType: "plate",
        referenceLabel: plateText,
        referenceImagePath: null,
        frameIndex: m.frameIndex,
        timestampSeconds: m.timestampSeconds,
        similarity: m.similarity,
        boundingBoxJson: m.boundingBoxJson,
      })),
    });
  }

  await writeAuditEntry({
    caseId,
    evidenceHash,
    actorId,
    action: "ANALYZED",
    device: "pramana-reference-match-plate",
  });

  return NextResponse.json({
    matchType: "plate",
    referenceLabel: plateText,
    threshold: PLATE_MATCH_THRESHOLD,
    plateCandidatesCompared: detections.length,
    matches: matches.map((m) => ({
      frameIndex: m.frameIndex,
      timestampSeconds: m.timestampSeconds,
      similarity: m.similarity,
      box: m.boundingBoxJson ? (JSON.parse(m.boundingBoxJson) as number[]) : null,
    })),
  });
}

async function handleFaceMatch(
  formData: FormData,
  caseId: string,
  evidenceId: string,
  evidenceHash: string,
  actorId: string,
) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Upload a reference face photo to match." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";

  const embedResult = await embedFace(buffer, mimeType).catch((error: unknown) => {
    console.error("[reference-match] embedFace failed on reference photo:", error);
    return null;
  });
  if (!embedResult) {
    return NextResponse.json(
      { error: "Face embedding failed — the ML service may be unreachable. Check it's running and try again." },
      { status: 502 },
    );
  }
  if (embedResult.faces.length === 0) {
    return NextResponse.json(
      { error: "No face detected in the reference photo — upload a clearer, more front-facing photo." },
      { status: 422 },
    );
  }
  // embed_faces sorts by MTCNN's own detection probability descending
  // (see detector.py) — the most-probable face in the reference photo is
  // the one used, same convention the deepfake classifier's own single-
  // face path already follows.
  const referenceEmbedding = embedResult.faces[0].embedding;

  const referenceImagePath = writeReferencePhoto(evidenceId, buffer, mimeType);

  const storedFaces = await db.cctvFrameFace.findMany({
    where: { evidenceId },
    select: {
      boundingBoxJson: true,
      embeddingJson: true,
      frameSample: { select: { frameIndex: true, timestampSeconds: true } },
    },
  });

  const matches: MatchRow[] = storedFaces
    .map((f) => ({
      frameIndex: f.frameSample.frameIndex,
      timestampSeconds: f.frameSample.timestampSeconds,
      similarity: cosineSimilarity(referenceEmbedding, JSON.parse(f.embeddingJson) as number[]),
      boundingBoxJson: f.boundingBoxJson,
    }))
    .filter((m) => m.similarity >= FACE_MATCH_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity);

  await db.referenceMatchResult.deleteMany({ where: { evidenceId, matchType: "face" } });
  if (matches.length > 0) {
    await db.referenceMatchResult.createMany({
      data: matches.map((m) => ({
        evidenceId,
        matchType: "face",
        referenceLabel: file.name || "reference-photo",
        referenceImagePath,
        frameIndex: m.frameIndex,
        timestampSeconds: m.timestampSeconds,
        similarity: m.similarity,
        boundingBoxJson: m.boundingBoxJson,
      })),
    });
  } else {
    // No match row will carry this run's referenceImagePath — clean it up
    // rather than leave an unreferenced file at this evidence's photo path.
    deleteReferencePhoto(referenceImagePath);
  }

  await writeAuditEntry({
    caseId,
    evidenceHash,
    actorId,
    action: "ANALYZED",
    device: "pramana-reference-match-face",
  });

  return NextResponse.json({
    matchType: "face",
    referenceLabel: file.name || "reference-photo",
    referenceImagePath: matches.length > 0 ? referenceImagePath : null,
    threshold: FACE_MATCH_THRESHOLD,
    facesCompared: storedFaces.length,
    matches: matches.map((m) => ({
      frameIndex: m.frameIndex,
      timestampSeconds: m.timestampSeconds,
      similarity: m.similarity,
      box: m.boundingBoxJson ? (JSON.parse(m.boundingBoxJson) as number[]) : null,
    })),
  });
}
