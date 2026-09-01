import "server-only";
import { db } from "@/lib/db";

export interface PropagationSighting {
  id: string;
  kind: "origin" | "cross-case" | "corpus";
  label: string;
  timestamp: Date;
  similarity: number | null;
  hammingDistance: number | null;
  linkHref: string | null;
}

export interface EvidencePropagation {
  evidenceId: string;
  mimeType: string;
  sightings: PropagationSighting[]; // chronological, always includes the case's own upload as "origin"
  spreadWindowMs: number | null; // null when there's nothing to compare against yet
}

/**
 * Real "propagation" view for a case's evidence — deliberately NOT the old
 * mock PropagationGraph's rich per-sighting scenario (screenshots, view
 * counts, named platforms like Telegram/X/WhatsApp with invented URLs).
 * That richness doesn't exist for real uploads: we don't run live/OSINT
 * scraping (explicit non-goal, PS4_MVP_BUILD_PLAN.md §1 item 4), so the
 * only genuine "this content appeared elsewhere" signal available is the
 * real EvidenceMatch (cross-case) and CorpusMatch (seeded corpus) rows
 * already produced by /investigate. This surfaces exactly that, ordered by
 * real timestamps, with nothing invented per sighting.
 */
export async function getRealCasePropagation(caseId: string): Promise<EvidencePropagation[]> {
  const evidenceList = await db.evidence.findMany({
    where: { caseId },
    orderBy: { uploadedAt: "desc" },
    include: {
      matchesFrom: { include: { matchedEvidence: { select: { uploadedAt: true, caseId: true } } } },
      corpusMatches: { include: { corpusItem: true } },
    },
  });

  return evidenceList.map((ev) => {
    const sightings: PropagationSighting[] = [
      {
        id: `origin-${ev.id}`,
        kind: "origin" as const,
        label: "This case",
        timestamp: ev.uploadedAt,
        similarity: null,
        hammingDistance: null,
        linkHref: null,
      },
      ...ev.matchesFrom.map((m) => ({
        id: m.id,
        kind: "cross-case" as const,
        label: `Case ${m.matchedCaseId}`,
        timestamp: m.matchedEvidence.uploadedAt,
        similarity: m.similarity,
        hammingDistance: m.hammingDistance,
        linkHref: `/cases/${m.matchedCaseId}`,
      })),
      ...ev.corpusMatches.map((m) => ({
        id: m.id,
        kind: "corpus" as const,
        label: m.corpusItem.sourcePlatform,
        timestamp: m.corpusItem.firstSeenAt,
        similarity: m.similarity,
        hammingDistance: m.hammingDistance,
        linkHref: null,
      })),
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const spreadWindowMs =
      sightings.length >= 2
        ? sightings[sightings.length - 1].timestamp.getTime() - sightings[0].timestamp.getTime()
        : null;

    return { evidenceId: ev.id, mimeType: ev.mimeType, sightings, spreadWindowMs };
  });
}
