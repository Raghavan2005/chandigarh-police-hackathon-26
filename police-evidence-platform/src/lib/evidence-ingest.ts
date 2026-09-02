import type { Evidence } from "@prisma/client";
import { db } from "@/lib/db";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, sha256Hex, writeEvidenceFile } from "@/lib/storage";
import { extractMetadata } from "@/lib/metadata";

interface IngestEvidenceInput {
  caseId: string;
  buffer: Buffer;
  mimeType: string;
  uploadedById: string;
  deviceIdentifier?: string;
  casePropertyNumber?: string;
  auditDevice?: string;
}

type IngestEvidenceResult =
  | { ok: true; evidence: Evidence }
  | { ok: false; status: 400; error: string }
  | { ok: false; status: 409; error: string; evidence: Evidence };

/**
 * The real upload path — server-side SHA-256 on the actual stored bytes,
 * content-addressed dedupe, UPLOADED audit entry, then Stage 1 metadata/EXIF
 * extraction with its own ANALYZED audit entry. Extracted out of
 * `evidence/route.ts` so the tablet capture route (`api/capture/[token]`)
 * can share the exact same hashing/dedupe/audit-chain logic instead of a
 * second, independently-maintained copy that could silently drift.
 */
export async function ingestEvidence(input: IngestEvidenceInput): Promise<IngestEvidenceResult> {
  if (input.buffer.length === 0) {
    return { ok: false, status: 400, error: "Uploaded file is empty." };
  }

  const sha256 = sha256Hex(input.buffer);

  const existing = await db.evidence.findUnique({
    where: { caseId_sha256: { caseId: input.caseId, sha256 } },
  });
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: "This exact file is already on this case's evidence record.",
      evidence: existing,
    };
  }

  const mimeType = input.mimeType || "application/octet-stream";
  // Written to disk before the DB transaction: if the transaction fails, an
  // orphaned file on disk is harmless (content-addressed by hash, no DB row
  // points to it); the reverse — a DB row with no corresponding file — would
  // be a real chain-of-custody problem, so that ordering isn't arbitrary.
  const filePath = writeEvidenceFile(sha256, mimeType, input.buffer);

  const { evidence, auditEntry } = await db.$transaction(async (tx) => {
    const evidence = await tx.evidence.create({
      data: {
        caseId: input.caseId,
        sha256,
        filePath,
        mimeType,
        uploadedById: input.uploadedById,
        deviceIdentifier: input.deviceIdentifier || undefined,
        casePropertyNumber: input.casePropertyNumber || undefined,
      },
    });
    // Same transaction as the evidence row — there is no such thing as
    // evidence entering the system without its UPLOADED entry committing in
    // the same act.
    const auditEntry = await writeAuditEntryInTx(
      {
        caseId: input.caseId,
        evidenceHash: sha256,
        actorId: input.uploadedById,
        action: "UPLOADED",
        device: input.auditDevice,
      },
      tx,
    );
    return { evidence, auditEntry };
  });

  appendCheckpoint(auditEntry);

  // Stage 1 (PS4_ANALYSIS_PIPELINE.md) — real metadata/EXIF extraction, run
  // after the upload transaction commits (ffprobe/exifr are external I/O,
  // not something to hold a SQLite transaction open for). A failure here
  // must not fail the upload itself — the evidence is already safely
  // recorded; a missing metadata row is a visible, honest gap, not a lost
  // upload. See extractMetadata's own per-file-type fallback behavior for
  // why this never throws.
  const extracted = await extractMetadata(resolveEvidencePath(evidence.filePath), mimeType, input.buffer);
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
      },
    });
    const metadataAuditEntry = await writeAuditEntryInTx(
      {
        caseId: input.caseId,
        evidenceHash: sha256,
        actorId: input.uploadedById,
        action: "ANALYZED",
        device: "pramana-metadata-extractor",
      },
      tx,
    );
    return { metadataAuditEntry };
  });
  appendCheckpoint(metadataAuditEntry);

  return { ok: true, evidence };
}
