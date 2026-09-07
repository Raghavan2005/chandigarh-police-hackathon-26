import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { computePipelineStatus } from "@/lib/pipeline-status";

/**
 * GET /api/cases/:caseId/evidence/:evidenceId/pipeline-status — named in
 * PS4_MVP_BUILD_PLAN.md §5 as "polled (or SSE) by the... pipeline panel."
 * /investigate runs as a single atomic call with no incremental progress
 * events to stream, so there's nothing genuine to push over SSE — this is
 * a real, poll-able snapshot of current DB state instead (same logic
 * RealPipelinePanel already renders server-side via getRealCase), which
 * satisfies the plan's own "(or SSE)" alternative honestly rather than
 * building streaming infrastructure with nothing real to stream.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;

  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      metadataResult: { select: { container: true, resolution: true, encoderSignature: true, exifJson: true } },
      detectionResult: { select: { manipulationProbability: true, generalAiProbability: true, modelName: true, modelVersion: true } },
      provenanceResult: { select: { c2paPresent: true, c2paValid: true } },
      fusionVerdict: { select: { coverageCount: true, verdict: true, confidence: true, computedAt: true } },
      matchesFrom: { select: { id: true } },
      corpusMatches: { select: { id: true } },
    },
  });

  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  return NextResponse.json(computePipelineStatus(evidence));
}
