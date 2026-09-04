import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { ingestEvidence } from "@/lib/evidence-ingest";
import { getRequestIp } from "@/lib/request-ip";

/**
 * Real upload: server-side SHA-256 computed on the actual stored bytes, not
 * the client-side cosmetic hash the original prototype showed (per
 * PS4_MVP_BUILD_PLAN.md §1 item — "must become a real server-side hash...
 * it cannot stay decorative in the MVP"). Hashing/dedupe/audit/metadata
 * logic lives in ingestEvidence (src/lib/evidence-ingest.ts), shared with
 * the tablet capture route (api/capture/[token]) — this handler is just the
 * authenticated formdata-parsing wrapper around it.
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

  const result = await ingestEvidence({
    caseId,
    buffer,
    mimeType: file.type || "application/octet-stream",
    uploadedById: session.userId,
    deviceIdentifier: typeof deviceIdentifier === "string" ? deviceIdentifier.trim() : undefined,
    casePropertyNumber: typeof casePropertyNumber === "string" ? casePropertyNumber.trim() : undefined,
    auditDevice: request.headers.get("user-agent") ?? undefined,
    auditIp: getRequestIp(request),
  });

  if (!result.ok) {
    if (result.status === 409) {
      return NextResponse.json({ error: result.error, evidence: result.evidence }, { status: 409 });
    }
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.evidence, { status: 201 });
}
