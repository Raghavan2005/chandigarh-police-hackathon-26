import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { resolveEvidencePath } from "@/lib/storage";
import { extractFrameAt } from "@/lib/frame-extract";
import { isReverseImageSearchConfigured, runReverseImageSearch } from "@/lib/reverse-image-search";

/**
 * Real reverse-image search (Cloud Vision Web Detection) — was an explicit,
 * honestly-labeled non-goal until real GCP credentials were available (see
 * PS4_MVP_BUILD_PLAN.md §7). Every call here is a fresh, real lookup
 * against Google's live index (never fabricated), and the result is
 * cached in `ReverseImageSearchResult` — direct user request: re-running a
 * real, billed external call every time a case is simply reopened is
 * wasteful and slow. The cache is explicitly timestamped and this same
 * route is what a "Re-run" click calls to refresh it, so a stored result
 * is presented honestly as "as of this time," not as a live re-check.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!isReverseImageSearchConfigured()) {
    return NextResponse.json(
      { error: "Reverse-image search isn't configured on this deployment (no GCP credentials set)." },
      { status: 501 },
    );
  }

  const { caseId, evidenceId } = await params;
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { detectionResult: true, metadataResult: true },
  });
  if (!evidence || evidence.caseId !== caseId) {
    return NextResponse.json({ error: "Evidence not found on this case." }, { status: 404 });
  }

  const isImage = evidence.mimeType.startsWith("image/");
  const isVideo = evidence.mimeType.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Reverse-image search is only available for image and video evidence." },
      { status: 422 },
    );
  }

  let imageBuffer: Buffer;
  if (isImage) {
    imageBuffer = await readFile(resolveEvidencePath(evidence.filePath));
  } else {
    // Same frame Grad-CAM already flagged as worst-scoring, if we have
    // it — searching the frame the classifier itself found most
    // suspicious, not an arbitrary one. Falls back to the midpoint if no
    // detection has run yet.
    let timestampSeconds = 0.5;
    if (evidence.detectionResult?.frameScoresJson) {
      try {
        const scores: { timestampSeconds: number; probability: number }[] = JSON.parse(
          evidence.detectionResult.frameScoresJson,
        );
        if (scores.length > 0) {
          timestampSeconds = scores.reduce((max, s) => (s.probability > max.probability ? s : max)).timestampSeconds;
        }
      } catch {
        // fall through to the default midpoint timestamp
      }
    } else if (evidence.metadataResult?.duration) {
      const duration = parseFloat(evidence.metadataResult.duration);
      if (Number.isFinite(duration) && duration > 0) timestampSeconds = duration / 2;
    }
    imageBuffer = await extractFrameAt(resolveEvidencePath(evidence.filePath), timestampSeconds);
  }

  const result = await runReverseImageSearch(imageBuffer).catch((error: unknown) => {
    console.error("[reverse-image-search] Vision API call failed:", error);
    return null;
  });
  if (!result) {
    return NextResponse.json(
      { error: "Reverse-image search failed — the external service may be unreachable or the credential invalid." },
      { status: 502 },
    );
  }

  const cached = await db.reverseImageSearchResult.upsert({
    where: { evidenceId },
    create: {
      evidenceId,
      fullMatchesJson: JSON.stringify(result.fullMatches),
      partialMatchesJson: JSON.stringify(result.partialMatches),
      pagesWithMatchesJson: JSON.stringify(result.pagesWithMatches),
      webEntitiesJson: JSON.stringify(result.webEntities),
      bestGuessLabelsJson: JSON.stringify(result.bestGuessLabels),
    },
    update: {
      fullMatchesJson: JSON.stringify(result.fullMatches),
      partialMatchesJson: JSON.stringify(result.partialMatches),
      pagesWithMatchesJson: JSON.stringify(result.pagesWithMatches),
      webEntitiesJson: JSON.stringify(result.webEntities),
      bestGuessLabelsJson: JSON.stringify(result.bestGuessLabels),
      ranAt: new Date(),
    },
  });

  await writeAuditEntry({
    caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "ANALYZED",
    device: "pramana-vision-api",
  });

  return NextResponse.json({ ...result, ranAt: cached.ranAt });
}
