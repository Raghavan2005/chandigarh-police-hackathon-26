import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { resolveEvidencePath, writeVideoDiff } from "@/lib/storage";
import { diffAgainstMatch } from "@/lib/video-diff";

/**
 * Real pixel diff against the most-similar real cross-case match — only
 * ever runs when a real EvidenceMatch links to another exhibit with an
 * actual file on disk. Seeded-corpus matches (CorpusMatch) can never
 * populate this: CorpusItem only stores a thumbnail, not a full source
 * file — the 422 below says so plainly instead of faking a diff.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { detectionResult: true, videoDiffResult: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }
  if (!evidence.mimeType.startsWith("video/")) {
    return NextResponse.json({ error: "Video diff is only available for video evidence." }, { status: 422 });
  }

  if (evidence.videoDiffResult) {
    return NextResponse.json(serializeVideoDiff(evidence.videoDiffResult));
  }

  const matches = await db.evidenceMatch.findMany({
    where: { evidenceId },
    orderBy: { similarity: "desc" },
  });

  let matchedFile: { id: string; filePath: string } | null = null;
  for (const match of matches) {
    const matchedEvidence = await db.evidence.findUnique({
      where: { id: match.matchedEvidenceId },
      select: { id: true, filePath: true, mimeType: true },
    });
    if (matchedEvidence && matchedEvidence.mimeType.startsWith("video/")) {
      matchedFile = matchedEvidence;
      break;
    }
  }

  if (!matchedFile) {
    const hasCorpusOnlyMatches = matches.length === 0 && (await db.corpusMatch.count({ where: { evidenceId } })) > 0;
    return NextResponse.json(
      {
        error: hasCorpusOnlyMatches
          ? "No full original available to diff against — this exhibit's only matches are from the seeded corpus, which stores a thumbnail, not a full source file."
          : "No cross-case video match found to diff against yet — run cross-case matching first, or this exhibit has no matches.",
      },
      { status: 422 },
    );
  }

  // Same representative timestamp the primary heatmap already uses — the
  // worst-scoring sampled frame — so the diff is comparing the exact
  // moment already flagged as most suspicious, not an arbitrary one.
  let timestampSeconds = 0;
  if (evidence.detectionResult?.frameScoresJson) {
    try {
      const scores: { timestampSeconds: number; probability: number }[] = JSON.parse(
        evidence.detectionResult.frameScoresJson,
      );
      if (scores.length > 0) {
        timestampSeconds = scores.reduce((max, s) => (s.probability > max.probability ? s : max)).timestampSeconds;
      }
    } catch {
      // fall through to the default timestamp
    }
  }

  const result = await diffAgainstMatch(
    resolveEvidencePath(evidence.filePath),
    resolveEvidencePath(matchedFile.filePath),
    timestampSeconds,
  ).catch((error: unknown) => {
    console.error("[video-diff] diff failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Video diff failed — one or both files may be unreadable at that timestamp." },
      { status: 502 },
    );
  }

  const diffImagePath = writeVideoDiff(evidence.id, result.diffPngBuffer);

  const saved = await db.videoDiffResult.create({
    data: {
      evidenceId: evidence.id,
      matchedEvidenceId: matchedFile.id,
      diffImagePath,
      diffPercentage: result.diffPercentage,
      timestampSeconds,
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-video-diff",
  });

  return NextResponse.json(serializeVideoDiff(saved));
}

function serializeVideoDiff(row: {
  matchedEvidenceId: string;
  diffPercentage: number;
  timestampSeconds: number;
  ranAt: Date;
}) {
  return {
    matchedEvidenceId: row.matchedEvidenceId,
    diffPercentage: row.diffPercentage,
    timestampSeconds: row.timestampSeconds,
    ranAt: row.ranAt,
  };
}
