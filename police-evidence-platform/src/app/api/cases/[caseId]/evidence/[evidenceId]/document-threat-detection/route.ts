import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { extractDocumentText } from "@/lib/document-analysis";
import { analyzeThreat, isThreatDetectionConfigured } from "@/lib/threat-detection";

/**
 * Same real Gemini threat judgment already used for call/video transcripts
 * (analyzeThreat, generic over any text) — applied here to a document
 * exhibit's actual extracted text instead. Separate route/cache from the
 * transcript one since a document has no TranscriptResult to hang off of.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isThreatDetectionConfigured()) {
    return NextResponse.json(
      { error: "Threat detection isn't configured on this deployment (no Cognition Engine credentials set)." },
      { status: 501 },
    );
  }

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      metadataResult: true,
      documentThreatAssessment: true,
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

  if (evidence.documentThreatAssessment) {
    return NextResponse.json(serializeThreatAssessment(evidence.documentThreatAssessment));
  }

  const text = extractDocumentText(evidence.metadataResult?.exifJson);
  if (!text) {
    return NextResponse.json(
      { error: "No extracted text available to analyze on this exhibit." },
      { status: 422 },
    );
  }

  const result = await analyzeThreat(text).catch((error: unknown) => {
    console.error("[document-threat-detection] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Threat detection failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const saved = await db.documentThreatAssessment.create({
    data: {
      evidenceId,
      containsThreat: result.containsThreat,
      severity: result.severity,
      reasoning: result.reasoning,
      quote: result.quote,
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-document-threat-detect",
  });

  return NextResponse.json(serializeThreatAssessment(saved));
}

function serializeThreatAssessment(row: {
  containsThreat: boolean;
  severity: string | null;
  reasoning: string | null;
  quote: string | null;
  ranAt: Date;
}) {
  return {
    containsThreat: row.containsThreat,
    severity: row.severity,
    reasoning: row.reasoning,
    quote: row.quote,
    ranAt: row.ranAt,
  };
}
