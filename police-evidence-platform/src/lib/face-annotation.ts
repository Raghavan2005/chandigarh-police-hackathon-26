import "server-only";
import { readFile } from "fs/promises";
import { db } from "@/lib/db";
import { resolveEvidencePath } from "@/lib/storage";

/**
 * Resolves a specific detected-face crop's bytes for a given evidence item
 * and face index, validating the index against the real stored
 * `faceCropPathsJson` array rather than trusting a client-supplied number
 * blindly. Returns null (never throws) when the evidence/detection/index
 * doesn't resolve to a real crop — callers turn that into a plain 404.
 */
export async function loadFaceCropBuffer(
  caseId: string,
  evidenceId: string,
  faceIndex: number,
): Promise<{ buffer: Buffer; evidenceSha256: string } | null> {
  if (!Number.isInteger(faceIndex) || faceIndex < 0) return null;

  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: { detectionResult: true },
  });
  if (!evidence || evidence.caseId !== caseId || !evidence.detectionResult) return null;

  let paths: string[] = [];
  try {
    paths = JSON.parse(evidence.detectionResult.faceCropPathsJson);
  } catch {
    return null;
  }
  const cropPath = paths[faceIndex];
  if (!cropPath) return null;

  const buffer = await readFile(resolveEvidencePath(cropPath));
  return { buffer, evidenceSha256: evidence.sha256 };
}
