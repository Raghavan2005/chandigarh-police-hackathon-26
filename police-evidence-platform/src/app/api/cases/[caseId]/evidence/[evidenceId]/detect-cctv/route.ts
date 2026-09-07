import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, writeCctvFrame } from "@/lib/storage";
import { detectObjects, embedFace } from "@/lib/ml-client";
import { sampleVideoFrames } from "@/lib/frame-extract";

// Disclosed sampling strategy for CCTV use case #1 — denser coverage than
// the deepfake pipeline's 6-frame whole-clip sample (PS4_USE_CASES.md item
// #1 explicitly calls this out: a person/vehicle/plate may only be
// on-screen for a couple of seconds). One frame every 2 seconds, capped at
// 40 frames (~80s of dense coverage; longer footage still gets 40 frames
// spread across its full length, just thinner per-second coverage) — a
// real compute/time budget tradeoff for a CPU-only local model, not an
// attempt to sample every frame.
const SAMPLE_INTERVAL_SECONDS = 2;
const MAX_SAMPLED_FRAMES = 40;

const VEHICLE_CLASSES = new Set(["car", "truck", "bus", "motorcycle"]);

/**
 * Real CCTV object/vehicle/plate/face detection over a whole video exhibit
 * (PS4_USE_CASES.md item #1) — densely samples the video (see
 * SAMPLE_INTERVAL_SECONDS above), runs every sampled frame through the
 * real torchvision COCO detector + EasyOCR plate reader
 * (ml-service/object_detector.py, plate_ocr.py) and real MTCNN face
 * detection + VGGFace2 embedding (ml-service/detector.py's embed_faces),
 * and persists one CctvFrameSample per frame with its real
 * VideoObjectDetection/CctvFrameFace children. Always re-runs fully on
 * each call (replacing this evidence's prior rows), matching /investigate's
 * own "re-run recomputes" semantics for this local, unbilled model — never
 * partially cached, never fabricated when nothing is found.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { metadataResult: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  if (!evidence.mimeType.startsWith("video/")) {
    return NextResponse.json(
      { error: "CCTV object/plate/face detection is only available for video evidence." },
      { status: 422 },
    );
  }

  const durationSeconds = evidence.metadataResult?.duration ? parseFloat(evidence.metadataResult.duration) : 0;
  const absolutePath = resolveEvidencePath(evidence.filePath);
  const frames = await sampleVideoFrames(absolutePath, durationSeconds, MAX_SAMPLED_FRAMES, SAMPLE_INTERVAL_SECONDS);
  if (frames.length === 0) {
    return NextResponse.json(
      { error: "Could not extract any frames from this video — check the file isn't corrupt or has a readable duration." },
      { status: 422 },
    );
  }

  // Real ML calls — must happen before the DB transaction below, same rule
  // /investigate already follows (a network/subprocess call has no place
  // holding a SQLite transaction open). One frame's failure (a transient
  // ML-service hiccup) doesn't sink the whole run — skipped, not faked.
  const frameResults = await Promise.all(
    frames.map(async (frame) => {
      const [objectsResult, facesResult] = await Promise.all([
        detectObjects(frame.buffer).catch((error: unknown) => {
          console.error(`[detect-cctv] object detection failed at ${frame.timestampSeconds.toFixed(2)}s:`, error);
          return null;
        }),
        embedFace(frame.buffer, "image/jpeg").catch((error: unknown) => {
          console.error(`[detect-cctv] face embedding failed at ${frame.timestampSeconds.toFixed(2)}s:`, error);
          return null;
        }),
      ]);
      return { frame, objectsResult, facesResult };
    }),
  );

  if (frameResults.every((r) => r.objectsResult === null && r.facesResult === null)) {
    return NextResponse.json(
      { error: "CCTV detection failed on every sampled frame — check the ML service is running and try again." },
      { status: 502 },
    );
  }

  const { summary, auditEntry } = await db.$transaction(async (tx) => {
    // Always a full re-run, same "recompute replaces" semantics as
    // /investigate's upsert — stale rows from a prior run (e.g. an older
    // sampling interval) would otherwise linger alongside fresh ones.
    await tx.videoObjectDetection.deleteMany({ where: { evidenceId } });
    await tx.cctvFrameFace.deleteMany({ where: { evidenceId } });
    await tx.cctvFrameSample.deleteMany({ where: { evidenceId } });

    let personCount = 0;
    const vehicleCountByClass: Record<string, number> = {};
    let faceCount = 0;
    const plateCandidates: { text: string; confidence: number; timestampSeconds: number }[] = [];

    for (let frameIndex = 0; frameIndex < frameResults.length; frameIndex++) {
      const { frame, objectsResult, facesResult } = frameResults[frameIndex];
      const imagePath = writeCctvFrame(evidence.id, frameIndex, frame.buffer);

      const objectDetections = (objectsResult?.objects ?? []).map((obj) => {
        if (obj.objectClass === "person") personCount += 1;
        else if (VEHICLE_CLASSES.has(obj.objectClass)) {
          vehicleCountByClass[obj.objectClass] = (vehicleCountByClass[obj.objectClass] ?? 0) + 1;
        }
        if (obj.plateText) {
          plateCandidates.push({
            text: obj.plateText,
            confidence: obj.plateConfidence ?? 0,
            timestampSeconds: frame.timestampSeconds,
          });
        }
        return {
          evidenceId,
          objectClass: obj.objectClass,
          confidence: obj.confidence,
          boundingBoxJson: JSON.stringify(obj.box),
          plateText: obj.plateText,
          plateConfidence: obj.plateConfidence,
        };
      });

      const faces = (facesResult?.faces ?? []).map((face) => {
        faceCount += 1;
        return {
          evidenceId,
          boundingBoxJson: JSON.stringify(face.box),
          embeddingJson: JSON.stringify(face.embedding),
          detectionProbability: face.detectionProbability,
        };
      });

      await tx.cctvFrameSample.create({
        data: {
          evidenceId,
          frameIndex,
          timestampSeconds: frame.timestampSeconds,
          imagePath,
          objectDetections: { create: objectDetections },
          faces: { create: faces },
        },
      });
    }

    const auditEntry = await writeAuditEntryInTx(
      { caseId, evidenceHash: evidence.sha256, actorId: session.userId, action: "ANALYZED", device: "pramana-detect-cctv" },
      tx,
    );

    return {
      summary: {
        frameCount: frameResults.length,
        personCount,
        vehicleCountByClass,
        faceCount,
        plateCandidates,
      },
      auditEntry,
    };
  });

  appendCheckpoint(auditEntry);

  return NextResponse.json(summary);
}
