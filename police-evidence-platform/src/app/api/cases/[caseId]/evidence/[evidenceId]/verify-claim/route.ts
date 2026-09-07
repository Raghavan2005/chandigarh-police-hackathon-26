import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { isClaimVerificationConfigured, verifyClaim } from "@/lib/claim-verification";

/**
 * Real, live Google Search-grounded claim verification — genuinely
 * different from threat-detection/description above: instead of judging
 * from Gemini's own training knowledge, this performs a real live search
 * and reports what real, current news/fact-check sources actually say
 * about the transcript's content. Same NCII/minor gate as every other
 * external-AI-call route: the transcript content still leaves the
 * platform on this call.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isClaimVerificationConfigured()) {
    return NextResponse.json(
      { error: "Claim verification isn't configured on this deployment (no Cognition Engine credentials set)." },
      { status: 501 },
    );
  }

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      transcriptResult: { include: { claimVerification: true } },
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
      { error: "Run captions on this exhibit first — claim verification analyzes the transcript, not the raw audio." },
      { status: 422 },
    );
  }

  if (evidence.transcriptResult.claimVerification) {
    return NextResponse.json(serializeClaimVerification(evidence.transcriptResult.claimVerification));
  }

  const segments: { text: string }[] = JSON.parse(evidence.transcriptResult.segmentsJson);
  const transcriptText = segments.map((s) => s.text).join(" ").trim();
  if (!transcriptText) {
    return NextResponse.json({ error: "This transcript is empty — nothing to verify." }, { status: 422 });
  }

  const result = await verifyClaim(transcriptText).catch((error: unknown) => {
    console.error("[verify-claim] Gemini call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Claim verification failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const saved = await db.claimVerificationResult.create({
    data: {
      transcriptResultId: evidence.transcriptResult.id,
      verdict: result.verdict,
      summary: result.summary,
      citationsJson: JSON.stringify(result.citations),
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-claim-verify",
  });

  return NextResponse.json(serializeClaimVerification(saved));
}

function serializeClaimVerification(row: { verdict: string; summary: string; citationsJson: string; ranAt: Date }) {
  return {
    verdict: row.verdict,
    summary: row.summary,
    citations: JSON.parse(row.citationsJson) as { title: string; url: string; domain: string }[],
    ranAt: row.ranAt,
  };
}
