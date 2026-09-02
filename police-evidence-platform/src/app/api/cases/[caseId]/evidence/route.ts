import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { appendCheckpoint, writeAuditEntryInTx } from "@/lib/audit";
import { resolveEvidencePath, sha256Hex, writeEvidenceFile } from "@/lib/storage";
import { extractMetadata } from "@/lib/metadata";

/**
 * Real upload: server-side SHA-256 computed on the actual stored bytes, not
 * the client-side cosmetic hash the original prototype showed (per
 * PS4_MVP_BUILD_PLAN.md §1 item — "must become a real server-side hash...
 * it cannot stay decorative in the MVP").
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId } = await params;
  const caseRecord = await db.case.findUnique({ where: { id: caseId } });
  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "A file is required (multipart field 'file')." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }

  const deviceIdentifier = formData?.get("deviceIdentifier");
  const casePropertyNumber = formData?.get("casePropertyNumber");

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = sha256Hex(buffer);

  const existing = await db.evidence.findUnique({
    where: { caseId_sha256: { caseId, sha256 } },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "This exact file is already on this case's evidence record.",
        evidence: existing,
      },
      { status: 409 },
    );
  }

  const mimeType = file.type || "application/octet-stream";
  // Written to disk before the DB transaction: if the transaction fails, an
  // orphaned file on disk is harmless (content-addressed by hash, no DB row
  // points to it); the reverse — a DB row with no corresponding file — would
  // be a real chain-of-custody problem, so that ordering isn't arbitrary.
  const filePath = writeEvidenceFile(sha256, mimeType, buffer);

  const { evidence, auditEntry } = await db.$transaction(async (tx) => {
    const evidence = await tx.evidence.create({
      data: {
        caseId,
        sha256,
        filePath,
        mimeType,
        uploadedById: session.userId,
        deviceIdentifier: typeof deviceIdentifier === "string" && deviceIdentifier ? deviceIdentifier : undefined,
        casePropertyNumber:
          typeof casePropertyNumber === "string" && casePropertyNumber ? casePropertyNumber : undefined,
      },
    });
    // Same transaction as the evidence row — per the plan, there is no
    // such thing as evidence entering the system without its UPLOADED
    // entry committing in the same act.
    const auditEntry = await writeAuditEntryInTx(
      {
        caseId,
        evidenceHash: sha256,
        actorId: session.userId,
        action: "UPLOADED",
        device: request.headers.get("user-agent") ?? undefined,
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
  const extracted = await extractMetadata(resolveEvidencePath(evidence.filePath), mimeType, buffer);
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
