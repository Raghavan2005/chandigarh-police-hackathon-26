import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

/**
 * GET /api/evidence/:id/cross-case-matches — named explicitly in
 * PS4_MVP_BUILD_PLAN.md §5's API surface as a standalone deliverable,
 * separate from the page-level fetch. The evidence viewer already gets
 * this same data embedded in getRealCase()'s server-rendered payload
 * (evidence.matchesFrom), so this route exists for programmatic/tooling
 * access to the same real EvidenceMatch rows, not as the page's primary
 * data path.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { evidenceId } = await params;

  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    select: { id: true, caseId: true },
  });
  if (!evidence) {
    return NextResponse.json({ error: "Evidence not found." }, { status: 404 });
  }

  const matches = await db.evidenceMatch.findMany({
    where: { evidenceId },
    include: {
      matchedEvidence: { select: { uploadedAt: true, mimeType: true, caseId: true } },
    },
  });

  return NextResponse.json({
    evidenceId,
    matches: matches.map((m) => ({
      id: m.id,
      matchedEvidenceId: m.matchedEvidenceId,
      matchedCaseId: m.matchedCaseId,
      matchType: m.matchType,
      similarity: m.similarity,
      hammingDistance: m.hammingDistance,
      matchedEvidenceUploadedAt: m.matchedEvidence.uploadedAt,
      matchedEvidenceMimeType: m.matchedEvidence.mimeType,
    })),
  });
}
