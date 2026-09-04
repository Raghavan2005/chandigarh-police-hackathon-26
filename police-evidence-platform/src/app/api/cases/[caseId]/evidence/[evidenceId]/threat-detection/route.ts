import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { analyzeThreat, isThreatDetectionConfigured } from "@/lib/threat-detection";

/**
 * Real Gemini judgment of whether a call/video transcript's actual content
 * contains a genuine threat — cached on the transcript like every other
 * on-demand AI analysis here, re-runnable but never automatic. Same
 * sensitivity gate as reverse-image-search/describe-image: the transcript
 * *content* still leaves the platform on this call, which is exactly the
 * exposure that gate exists to prevent for NCII/minor-sensitivity cases.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isThreatDetectionConfigured()) {
    return NextResponse.json(
      { error: "Threat detection isn't configured on this deployment (no Gemini credentials set)." },
      { status: 501 },
    );
  }

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      transcriptResult: { include: { threatAssessment: true } },
      case: { select: { sensitivityLevel: true } },
    },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  if (evidence.case.sensitivityLevel !== "standard") {
    return NextResponse.json(
      { error: "This evidence is flagged sensitive — sending its transcript to an external service is blocked to avoid exposing it outside this platform." },
      { status: 403 },
    );
  }

  if (!evidence.transcriptResult) {
    return NextResponse.json(
      { error: "Run captions on this exhibit first — threat detection analyzes the transcript, not the raw audio." },
      { status: 422 },
    );
  }

  if (evidence.transcriptResult.threatAssessment) {
    return NextResponse.json(serializeThreatAssessment(evidence.transcriptResult.threatAssessment));
  }

  const segments: { text: string }[] = JSON.parse(evidence.transcriptResult.segmentsJson);
  const transcriptText = segments.map((s) => s.text).join(" ").trim();
  if (!transcriptText) {
    return NextResponse.json(
      { error: "This transcript is empty — nothing to analyze." },
      { status: 422 },
    );
  }

  const result = await analyzeThreat(transcriptText).catch((error: unknown) => {
    console.error("[threat-detection] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Threat detection failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const saved = await db.threatAssessment.create({
    data: {
      transcriptResultId: evidence.transcriptResult.id,
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
    device: "pramana-threat-detect",
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
