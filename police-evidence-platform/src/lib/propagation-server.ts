import "server-only";
import { db } from "@/lib/db";
import { resolveSightingLocation, type SightingLocation } from "@/lib/geo";

export interface PropagationSighting {
  id: string;
  kind: "origin" | "cross-case" | "corpus";
  label: string;
  timestamp: Date;
  similarity: number | null;
  hammingDistance: number | null;
  matchType: "sha256_exact" | "phash_near" | null; // cross-case only — exact file vs. near-duplicate
  linkHref: string | null;
  sourceUrl: string | null; // corpus only — the actual external URL the item was captured from
  thumbnail:
    | { kind: "gated"; caseId: string; evidenceId: string; mimeType: string; sensitivityLevel: string }
    | { kind: "static"; src: string }
    | null;
  location: SightingLocation | null;
}

/**
 * EXIF GPS (exact, from the file) if present, else the IP the evidence was
 * uploaded from (approximate, city-level) if that request happened to carry
 * a resolvable IP — neither is guaranteed, most real evidence will have
 * neither and this returns null, not a guess.
 */
async function resolveEvidenceLocation(
  caseId: string,
  sha256: string,
  gps: { gpsLatitude: number | null; gpsLongitude: number | null } | null,
): Promise<SightingLocation | null> {
  const uploadEntry = await db.auditLogEntry.findFirst({
    where: { caseId, evidenceHash: sha256, action: "UPLOADED" },
    select: { ipAddress: true },
  });
  return resolveSightingLocation({
    exifLat: gps?.gpsLatitude ?? null,
    exifLon: gps?.gpsLongitude ?? null,
    ip: uploadEntry?.ipAddress ?? null,
  });
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
  const thisCase = await db.case.findUnique({ where: { id: caseId }, select: { sensitivityLevel: true } });
  if (!thisCase) return [];

  const evidenceList = await db.evidence.findMany({
    where: { caseId },
    orderBy: { uploadedAt: "desc" },
    include: {
      metadataResult: { select: { gpsLatitude: true, gpsLongitude: true } },
      matchesFrom: {
        include: {
          matchedEvidence: {
            select: {
              uploadedAt: true,
              caseId: true,
              mimeType: true,
              sha256: true,
              case: { select: { sensitivityLevel: true } },
              metadataResult: { select: { gpsLatitude: true, gpsLongitude: true } },
            },
          },
        },
      },
      corpusMatches: { include: { corpusItem: true } },
    },
  });

  return Promise.all(
    evidenceList.map(async (ev) => {
      const originLocation = await resolveEvidenceLocation(caseId, ev.sha256, ev.metadataResult);
      const crossCaseSightings = await Promise.all(
        ev.matchesFrom.map(async (m) => ({
          id: m.id,
          kind: "cross-case" as const,
          label: `Case ${m.matchedCaseId}`,
          timestamp: m.matchedEvidence.uploadedAt,
          similarity: m.similarity,
          hammingDistance: m.hammingDistance,
          matchType: m.matchType as "sha256_exact" | "phash_near",
          linkHref: `/cases/${m.matchedCaseId}`,
          sourceUrl: null,
          thumbnail: {
            kind: "gated" as const,
            caseId: m.matchedCaseId,
            evidenceId: m.matchedEvidenceId,
            mimeType: m.matchedEvidence.mimeType,
            sensitivityLevel: m.matchedEvidence.case.sensitivityLevel,
          },
          location: await resolveEvidenceLocation(
            m.matchedCaseId,
            m.matchedEvidence.sha256,
            m.matchedEvidence.metadataResult,
          ),
        })),
      );

      const sightings: PropagationSighting[] = [
        {
          id: `origin-${ev.id}`,
          kind: "origin" as const,
          label: "This case",
          timestamp: ev.uploadedAt,
          similarity: null,
          hammingDistance: null,
          matchType: null,
          linkHref: null,
          sourceUrl: null,
          thumbnail: {
            kind: "gated" as const,
            caseId,
            evidenceId: ev.id,
            mimeType: ev.mimeType,
            sensitivityLevel: thisCase.sensitivityLevel,
          },
          location: originLocation,
        },
        ...crossCaseSightings,
        ...ev.corpusMatches.map((m) => ({
          id: m.id,
          kind: "corpus" as const,
          label: m.corpusItem.sourcePlatform,
          timestamp: m.corpusItem.firstSeenAt,
          similarity: m.similarity,
          hammingDistance: m.hammingDistance,
          matchType: null,
          linkHref: null,
          sourceUrl: m.corpusItem.sourceUrl,
          thumbnail: { kind: "static" as const, src: m.corpusItem.thumbnailPath },
          // No GPS/IP data exists for seeded corpus items — disclosed as
          // unavailable, never guessed.
          location: null,
        })),
      ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      const spreadWindowMs =
        sightings.length >= 2
          ? sightings[sightings.length - 1].timestamp.getTime() - sightings[0].timestamp.getTime()
          : null;

      return { evidenceId: ev.id, mimeType: ev.mimeType, sightings, spreadWindowMs };
    }),
  );
}
