import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCaptureLink } from "@/lib/capture-link";
import { ingestEvidence } from "@/lib/evidence-ingest";
import { runImageInvestigation } from "@/lib/investigate-image";

/**
 * Public — deliberately no requireSession(). Authorization is the capture
 * token alone (see CaptureLink schema comment): re-validated here on every
 * request, never trusting the page's own (UX-only) validation. This route
 * has exactly one capability — upload one photo into the token's case and
 * auto-run detection on it — nothing else is reachable through it.
 *
 * Known, accepted limitation for this controlled-network hackathon demo: no
 * rate limiting/CAPTCHA on this endpoint. The token's 32-byte randomness
 * plus its several-hour expiry (see mintCaptureLink) is the only
 * protection — not production-grade, and not meant to be for this build.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const link = await validateCaptureLink(token);
  if (!link) {
    return NextResponse.json({ error: "This capture link has expired or is invalid." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "A file is required (multipart field 'file')." }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  if (!mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "Only photo capture is supported here." }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const ingestResult = await ingestEvidence({
    caseId: link.caseId,
    buffer,
    mimeType,
    uploadedById: link.createdByUserId,
    auditDevice: "pramana-tablet-capture",
  });

  if (!ingestResult.ok) {
    if (ingestResult.status === 409) {
      return NextResponse.json({ error: ingestResult.error }, { status: 409 });
    }
    return NextResponse.json({ error: ingestResult.error }, { status: ingestResult.status });
  }

  const investigation = await runImageInvestigation({
    evidenceId: ingestResult.evidence.id,
    caseId: link.caseId,
    actorId: link.createdByUserId,
    auditDevice: "pramana-tablet-capture",
  });

  await db.captureLink.update({ where: { id: link.id }, data: { usedAt: new Date() } });

  if (!investigation.ok) {
    // The photo is safely on the case even if auto-detect failed — surface
    // that honestly rather than pretending the whole capture failed.
    return NextResponse.json(
      { evidenceId: ingestResult.evidence.id, error: `Captured, but detection failed: ${investigation.error}` },
      { status: 207 },
    );
  }

  return NextResponse.json(
    {
      evidenceId: ingestResult.evidence.id,
      verdict: investigation.verdict,
      confidence: investigation.confidence,
      explanation: investigation.explanation,
    },
    { status: 201 },
  );
}
