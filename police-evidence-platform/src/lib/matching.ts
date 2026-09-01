import type { Prisma } from "@prisma/client";
import { hammingDistance } from "@/lib/hamming";

// Matches perceptual-hash.ts: 64-bit dHash, packed as 16 hex chars.
const HASH_BITS = 64;

// "Near-duplicate" threshold: <=10% of bits differing. 10% of 64 bits = 6.4,
// so <=6 bits different is the threshold used here. Reasoning:
//  - Looser than this and false positives climb fast — a 64-bit dHash only
//    has so much discriminating power, and past ~15% distance you start
//    matching visually distinct images, not re-encodes of the same one.
//  - Tighter than this risks missing legitimate re-saves: a JPEG re-encoded
//    at a different quality/resolution routinely lands a few bits away from
//    its original (confirmed empirically in this task's throwaway test
//    script — see the PR/task notes for the measured distances).
// This mirrors the same threshold CorpusMatch and EvidenceMatch both use,
// per PS4_MVP_BUILD_PLAN.md §4's note that cross-case search generalizes
// the corpus-matching mechanism rather than inventing a second one.
const NEAR_DUPLICATE_THRESHOLD = 6;

function similarityFromDistance(distance: number): number {
  return 1 - distance / HASH_BITS;
}

/**
 * Finds near-duplicate/exact matches for a newly-hashed piece of evidence,
 * both against the seeded corpus (CorpusItem -> CorpusMatch) and against
 * every OTHER case's own evidence (Evidence -> EvidenceMatch — this is the
 * cross-case search feature, PS4_MVP_BUILD_PLAN.md §2/§4). Deliberately
 * hash/phash only, no face-embedding matching — see the schema.prisma
 * comment on EvidenceMatch and the build plan's "New fields/table, added
 * per the simulated jury panel" note for why that's an explicit scope cut,
 * not an oversight.
 *
 * Takes a Prisma transaction client so the caller (the upload route,
 * wired in separately) can call this inside the same `db.$transaction` as
 * the Evidence write itself — same pattern as writeAuditEntryInTx in
 * audit.ts: there should never be an Evidence row with phash set but no
 * corresponding match-scan having run against it.
 *
 * This function only checks perceptual-hash distance — it does not
 * independently verify sha256 equality, so every match it creates is
 * recorded with matchType "phash_near", even when the distance happens to
 * be 0. (A 0-distance dHash match is a strong signal but not a proof of
 * byte-identical files — genuinely different images can collide on a
 * 64-bit hash.) Recording a true "sha256_exact" match, if a case ever
 * needs that distinction called out explicitly, is a separate, cheaper
 * check the caller already has the data to do directly (Evidence.sha256 is
 * indexed) and is out of scope for this function per the task split.
 */
export async function findMatches(
  evidenceId: string,
  phash: string,
  caseId: string,
  tx: Prisma.TransactionClient,
): Promise<{ corpusMatchCount: number; evidenceMatchCount: number }> {
  // No native Hamming-distance operator in SQLite/Prisma, and both tables
  // are small (seeded corpus, one case's worth of other-case evidence at a
  // time) for an MVP — fetch candidates and compare in JS rather than
  // reaching for a raw SQL bit-diff query that would only pay for itself at
  // a corpus size this project isn't going to hit.
  const corpusItems = await tx.corpusItem.findMany({ select: { id: true, phash: true } });

  let corpusMatchCount = 0;
  for (const item of corpusItems) {
    const distance = hammingDistance(phash, item.phash);
    if (distance <= NEAR_DUPLICATE_THRESHOLD) {
      await tx.corpusMatch.create({
        data: {
          evidenceId,
          corpusItemId: item.id,
          similarity: similarityFromDistance(distance),
          hammingDistance: distance,
        },
      });
      corpusMatchCount++;
    }
  }

  // Cross-case search (§2, §4): every OTHER case's evidence, not this
  // case's own — matching within the same case isn't cross-case, it's just
  // the investigator uploading the same file twice, which the
  // @@unique([caseId, sha256]) constraint on Evidence already prevents at
  // intake. Only rows with a computed phash are candidates (audio/document
  // evidence leaves phash null, per the schema comment on Evidence.phash).
  const otherEvidence = await tx.evidence.findMany({
    where: {
      caseId: { not: caseId },
      phash: { not: null },
    },
    select: { id: true, phash: true, caseId: true },
  });

  let evidenceMatchCount = 0;
  for (const other of otherEvidence) {
    // `phash: { not: null }` above guarantees this at runtime; Prisma's
    // types don't narrow the selected field through a where clause.
    const otherPhash = other.phash as string;
    const distance = hammingDistance(phash, otherPhash);
    if (distance <= NEAR_DUPLICATE_THRESHOLD) {
      await tx.evidenceMatch.create({
        data: {
          evidenceId,
          matchedEvidenceId: other.id,
          matchedCaseId: other.caseId,
          matchType: "phash_near",
          similarity: similarityFromDistance(distance),
          hammingDistance: distance,
        },
      });
      evidenceMatchCount++;
    }
  }

  // No matches is the normal case for most uploads, especially early on
  // before the corpus/other cases have much in them — return the zeroed
  // counts cleanly rather than treating an empty result as an error.
  return { corpusMatchCount, evidenceMatchCount };
}
