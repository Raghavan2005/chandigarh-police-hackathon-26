import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { extractDocumentText, isDocumentAnalysisConfigured, summarizeDocument } from "@/lib/document-analysis";

/**
 * Real Gemini plain-language summary of a document exhibit's actual
 * extracted text — cached like every other on-demand AI analysis here.
 * Same NCII/minor sensitivity gate as reverse-image-search/describe-image:
 * the document's text still leaves the platform on this call.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isDocumentAnalysisConfigured()) {
    return NextResponse.json(
      { error: "Document summarization isn't configured on this deployment (no Cognition Engine credentials set)." },
      { status: 501 },
    );
  }

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      metadataResult: true,
      documentSummaryResult: true,
      case: { select: { sensitivityLevel: true } },
    },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  if (evidence.case.sensitivityLevel !== "standard") {
    return NextResponse.json(
      { error: "This evidence is flagged sensitive — sending its text to an external service is blocked to avoid exposing it outside this platform." },
      { status: 403 },
    );
  }

  if (evidence.documentSummaryResult) {
    return NextResponse.json(serializeSummary(evidence.documentSummaryResult));
  }

  const text = extractDocumentText(evidence.metadataResult?.exifJson);
  if (!text) {
    return NextResponse.json(
      { error: "No extracted text available to summarize on this exhibit." },
      { status: 422 },
    );
  }

  const result = await summarizeDocument(text).catch((error: unknown) => {
    console.error("[document-summary] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Document summarization failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const saved = await db.documentSummaryResult.create({
    data: { evidenceId, summary: result.summary },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-document-summary",
  });

  return NextResponse.json(serializeSummary(saved));
}

function serializeSummary(row: { summary: string; ranAt: Date }) {
  return { summary: row.summary, ranAt: row.ranAt };
}
