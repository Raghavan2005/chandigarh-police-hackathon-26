import type { Evidence } from "@prisma/client";
import { db } from "@/lib/db";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, sha256Hex, writeEvidenceFile } from "@/lib/storage";
import { extractMetadata } from "@/lib/metadata";
import { fuseDocumentEvidence } from "@/lib/document-fusion";
import { extractDocumentText } from "@/lib/document-analysis";
import { extractLocationMentions, isLocationExtractionConfigured } from "@/lib/location-extraction";

interface PdfSignatureExifFields {
  signaturePresent?: boolean;
  signatureCoversWholeFile?: boolean | null;
  signerName?: string | null;
  modifiedAfterCreation?: boolean;
}

interface IngestEvidenceInput {
  caseId: string;
  buffer: Buffer;
  mimeType: string;
  uploadedById: string;
  deviceIdentifier?: string;
  casePropertyNumber?: string;
  auditDevice?: string;
  auditIp?: string | null;
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
        ipAddress: input.auditIp ?? undefined,
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
        gpsLatitude: extracted.gpsLatitude,
        gpsLongitude: extracted.gpsLongitude,
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

  // Documents have no ML classifier and no separate "Investigate" click
  // (see investigate/route.ts's own 422 for this evidence type) — the two
  // real, structural signals that DO exist for a PDF (digital-signature
  // check, creation-vs-modification-date consistency) are both already
  // computed synchronously above, so there is no reason to wait for a
  // manual action before turning them into a verdict. Previously they sat
  // unused in metadataResult.exifJson while the UI told the investigator
  // "no verdict to show" — misleading once real signals actually exist.
  if (extracted.container === "PDF" && extracted.exifJson) {
    let exif: PdfSignatureExifFields = {};
    try {
      exif = JSON.parse(extracted.exifJson);
    } catch {
      exif = {};
    }
    const fusion = fuseDocumentEvidence({
      signaturePresent: exif.signaturePresent ?? false,
      signatureCoversWholeFile: exif.signatureCoversWholeFile ?? null,
      signerName: exif.signerName ?? null,
      modifiedAfterCreation: exif.modifiedAfterCreation ?? false,
    });
    const { documentFusionAuditEntry } = await db.$transaction(async (tx) => {
      await tx.fusionVerdict.create({
        data: {
          evidenceId: evidence.id,
          verdict: fusion.verdict,
          confidence: fusion.confidence,
          coverageCount: fusion.coverageCount,
          confidenceCeiling: fusion.confidenceCeiling,
          explanation: fusion.explanation,
          signalBreakdownJson: JSON.stringify(fusion.signalBreakdown),
        },
      });
      const documentFusionAuditEntry = await writeAuditEntryInTx(
        {
          caseId: input.caseId,
          evidenceHash: sha256,
          actorId: input.uploadedById,
          action: "ANALYZED",
          device: "pramana-document-fusion",
        },
        tx,
      );
      return { documentFusionAuditEntry };
    });
    appendCheckpoint(documentFusionAuditEntry);
  }

  // Real place-name extraction + geocoding (location-extraction.ts) — runs
  // automatically here rather than as an on-demand button, by explicit
  // product decision: an investigator opening a freshly-uploaded chat/
  // document exhibit should already see any real place mentions plotted on
  // the Source Finder map, not need to remember to click something first.
  // Only possible when extractMetadata actually produced real text (chat
  // exports and PDFs; see extractDocumentText's own mimeType-agnostic
  // reading of exifJson.textPreview) — most evidence types (image/video/
  // audio) have no text at all, and this is a genuine no-op for them, not a
  // silently-skipped feature. A sensitive case (NCII/minor) never sends its
  // evidence text to Gemini or its extracted place names to a third-party
  // geocoding service, same rule as every other AI call in this app.
  const text = extractDocumentText(extracted.exifJson);
  if (text && isLocationExtractionConfigured()) {
    const thisCase = await db.case.findUnique({ where: { id: input.caseId }, select: { sensitivityLevel: true } });
    if (thisCase && thisCase.sensitivityLevel === "standard") {
      try {
        const locations = await extractLocationMentions(text);
        const { locationAuditEntry } = await db.$transaction(async (tx) => {
          await tx.locationMentionResult.create({
            data: { evidenceId: evidence.id, locationsJson: JSON.stringify(locations) },
          });
          const locationAuditEntry = await writeAuditEntryInTx(
            {
              caseId: input.caseId,
              evidenceHash: sha256,
              actorId: input.uploadedById,
              action: "ANALYZED",
              device: "pramana-location-extractor",
            },
            tx,
          );
          return { locationAuditEntry };
        });
        appendCheckpoint(locationAuditEntry);
      } catch (error) {
        // Same rule as metadata extraction above: a failed AI call or a
        // Nominatim outage must never fail the upload itself — the evidence
        // is already safely recorded, a missing LocationMentionResult row
        // is a visible, honest gap (no markers show up), not a lost upload.
        console.warn(`[evidence-ingest] Location extraction failed for evidence ${evidence.id}:`, error);
      }
    }
  }

  return { ok: true, evidence };
}
