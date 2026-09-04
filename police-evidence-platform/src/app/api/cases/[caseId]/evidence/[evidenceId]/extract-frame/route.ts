import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, sha256Hex, writeEvidenceFile } from "@/lib/storage";
import { extractFrameAt } from "@/lib/frame-extract";
import { extractMetadata } from "@/lib/metadata";

/**
 * Real "extract this frame as evidence" action — replaces the old mock
 * page's Snapshot button, which only ever showed a fake
 * `alert("Frame captured and appended to evidence report.")` with nothing
 * actually saved. This re-extracts the exact frame via ffmpeg (the same
 * real primitive used for classifier frame sampling — see
 * frame-extract.ts), hashes it, and saves it as a genuine new image
 * Evidence row on the same case, with real provenance back to the source
 * video and the exact timestamp, so an investigator can pull a specific
 * still out of a video and have it stand as its own citable exhibit.
 */
const extractFrameSchema = z.object({
  timestampSeconds: z.number().min(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;

  const parsed = extractFrameSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid extract-frame request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const source = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!source || source.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  if (!source.mimeType.startsWith("video/")) {
    return NextResponse.json({ error: "Frame extraction is only available for video evidence." }, { status: 422 });
  }

  const frameBuffer = await extractFrameAt(resolveEvidencePath(source.filePath), parsed.data.timestampSeconds).catch(
    () => null,
  );
  if (!frameBuffer) {
    return NextResponse.json(
      { error: "Could not extract a frame at that timestamp — check it's within the video's duration." },
      { status: 422 },
    );
  }

  const sha256 = sha256Hex(frameBuffer);
  const existing = await db.evidence.findUnique({ where: { caseId_sha256: { caseId, sha256 } } });
  if (existing) {
    return NextResponse.json(
      { error: "This exact frame is already saved as evidence on this case.", evidence: existing },
      { status: 409 },
    );
  }

  const mimeType = "image/jpeg";
  const filePath = writeEvidenceFile(sha256, mimeType, frameBuffer);

  const { evidence, auditEntry } = await db.$transaction(async (tx) => {
    const evidence = await tx.evidence.create({
      data: {
        caseId,
        sha256,
        filePath,
        mimeType,
        uploadedById: session.userId,
        derivedFromEvidenceId: source.id,
        derivedAtTimestampSeconds: parsed.data.timestampSeconds,
      },
    });
    const auditEntry = await writeAuditEntryInTx(
      {
        caseId,
        evidenceHash: sha256,
        actorId: session.userId,
        action: "UPLOADED",
        device: "pramana-frame-extract",
      },
      tx,
    );
    return { evidence, auditEntry };
  });

  appendCheckpoint(auditEntry);

  // Same real metadata extraction every normal upload gets — keeps the
  // extracted frame's Technical Provenance box consistent with every other
  // image exhibit, not a stripped-down special case.
  const extracted = await extractMetadata(resolveEvidencePath(evidence.filePath), mimeType, frameBuffer);
  const { metadataAuditEntry } = await db.$transaction(async (tx) => {
    await tx.metadataResult.create({
      data: {
        evidenceId: evidence.id,
        container: extracted.container,
        resolution: extracted.resolution,
        duration: extracted.duration,
        codec: extracted.codec,
        encoderSignature: extracted.encoderSignature,
        exifJson: extracted.exifJson,
        gpsLatitude: extracted.gpsLatitude,
        gpsLongitude: extracted.gpsLongitude,
      },
    });
    const metadataAuditEntry = await writeAuditEntryInTx(
      {
        caseId,
        evidenceHash: sha256,
        actorId: session.userId,
        action: "ANALYZED",
        device: "pramana-metadata-extractor",
      },
      tx,
    );
    return { metadataAuditEntry };
  });
  appendCheckpoint(metadataAuditEntry);

  return NextResponse.json(evidence, { status: 201 });
}
