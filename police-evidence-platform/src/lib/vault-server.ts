import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { EvidenceKind, Verdict } from "@/lib/types";

/**
 * Evidence Vault — a read-only, cross-case index of every exhibit ever
 * uploaded (Docs/Plan for this feature: global search by hash/case/verdict,
 * distinct from the per-case Evidence tab in cases-server.ts). This file
 * only reads; all mutations (override, custody transfer, investigate, ...)
 * still happen from the case page, which is the one editing surface.
 */

export interface VaultListItem {
  id: string;
  caseId: string;
  caseTitle: string;
  sensitivityLevel: string;
  mimeType: string;
  sha256: string;
  uploadedAt: Date;
  uploadedByName: string;
  verdict: Verdict | null;
  confidence: number | null;
  legalHold: boolean;
  retentionUntil: Date | null;
}

export interface VaultFilters {
  q?: string;
  type?: EvidenceKind;
  verdict?: Verdict;
  dateFrom?: string; // inclusive, YYYY-MM-DD
  dateTo?: string; // inclusive, YYYY-MM-DD
  legalHoldOnly?: boolean;
  expiringSoon?: boolean; // retentionUntil within 30 days, not on legal hold
  page?: number;
  pageSize?: number;
}

const EXPIRING_SOON_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_PAGE_SIZE = 25;

function typeWhereClause(type?: EvidenceKind): Prisma.EvidenceWhereInput {
  if (!type) return {};
  if (type === "document") {
    // "document" has no shared mimeType prefix — anything that isn't
    // image/video/audio counts, matching the inline classification used
    // elsewhere (e.g. evidence-tabs.tsx's isImage/isVideo/isAudio checks).
    return {
      AND: [
        { mimeType: { not: { startsWith: "image/" } } },
        { mimeType: { not: { startsWith: "video/" } } },
        { mimeType: { not: { startsWith: "audio/" } } },
      ],
    };
  }
  return { mimeType: { startsWith: `${type}/` } };
}

export async function listVaultEvidence(filters: VaultFilters): Promise<{
  items: VaultListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  // dateTo is inclusive of the whole calendar day, not just its 00:00 instant.
  const dateToExclusive = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`) : undefined;
  const expiringBefore = filters.expiringSoon ? new Date(Date.now() + EXPIRING_SOON_WINDOW_MS) : undefined;

  const where: Prisma.EvidenceWhereInput = {
    ...typeWhereClause(filters.type),
    ...(filters.verdict ? { fusionVerdict: { verdict: filters.verdict } } : {}),
    ...(filters.q
      ? {
          OR: [
            { caseId: { contains: filters.q } },
            { sha256: { contains: filters.q } },
          ],
        }
      : {}),
    ...(filters.dateFrom || dateToExclusive
      ? {
          uploadedAt: {
            ...(filters.dateFrom ? { gte: new Date(`${filters.dateFrom}T00:00:00`) } : {}),
            ...(dateToExclusive ? { lte: dateToExclusive } : {}),
          },
        }
      : {}),
    ...(filters.legalHoldOnly ? { legalHold: true } : {}),
    ...(expiringBefore
      ? { legalHold: false, retentionUntil: { not: null, lte: expiringBefore } }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.evidence.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        case: { select: { title: true, sensitivityLevel: true } },
        uploadedBy: { select: { name: true } },
        fusionVerdict: { select: { verdict: true, confidence: true } },
      },
    }),
    db.evidence.count({ where }),
  ]);

  return {
    items: rows.map((e) => ({
      id: e.id,
      caseId: e.caseId,
      caseTitle: e.case.title,
      sensitivityLevel: e.case.sensitivityLevel,
      mimeType: e.mimeType,
      sha256: e.sha256,
      uploadedAt: e.uploadedAt,
      uploadedByName: e.uploadedBy.name,
      verdict: (e.fusionVerdict?.verdict as Verdict | undefined) ?? null,
      confidence: e.fusionVerdict?.confidence ?? null,
      legalHold: e.legalHold,
      retentionUntil: e.retentionUntil,
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * Single exhibit, case-agnostic. Loads the exact relation set
 * cases-server.ts's getRealCase() loads per evidence item — EvidenceCard
 * requires that shape — plus the minimal parent-case fields the Vault
 * detail page itself needs (id/sensitivityLevel to render EvidenceCard,
 * title for the "view in case" link).
 */
export async function getVaultEvidenceDetail(evidenceId: string) {
  const evidence = await db.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      case: { select: { id: true, title: true, sensitivityLevel: true } },
      metadataResult: true,
      detectionResult: true,
      provenanceResult: true,
      fusionVerdict: true,
      forensicExpert: true,
      reverseImageSearchResults: true,
      imageDescriptionResult: true,
      transcriptResult: { include: { translations: true, threatAssessment: true } },
      videoDiffResult: true,
      faceAnnotations: true,
      overrides: { orderBy: { timestamp: "desc" }, include: { overriddenBy: { select: { name: true } } } },
      uploadedBy: { select: { name: true } },
      matchesFrom: true,
      corpusMatches: { include: { corpusItem: true } },
      custodyTransfers: { orderBy: { occurredAt: "asc" }, include: { recordedBy: { select: { name: true } } } },
    },
  });
  if (!evidence) return null;

  // Exhibit numbering matches EvidenceTabs' convention (evidence ordered
  // newest-first within a case, per cases-server.ts's listing order) —
  // computed with a count rather than fetching every sibling exhibit,
  // since the Vault only needs this one.
  const exhibitNumber =
    1 +
    (await db.evidence.count({
      where: { caseId: evidence.caseId, uploadedAt: { gt: evidence.uploadedAt } },
    }));

  return { evidence, exhibitNumber };
}

export interface CustodyRollupEntry {
  id: string;
  evidenceId: string;
  caseId: string;
  caseTitle: string;
  isSourceExhibit: boolean;
  fromPerson: string;
  toPerson: string;
  purpose: string;
  location: string | null;
  occurredAt: Date;
  recordedByName: string;
  witness1Name: string | null;
  witness2Name: string | null;
}

/**
 * Phase D — cross-case chain-of-custody roll-up. EvidenceMatch rows are
 * written one-directionally (matching.ts only writes evidenceId ->
 * matchedEvidenceId for the exhibit being investigated, never the reverse
 * row too), so "is this exhibit's content linked to that one" must be
 * checked in both directions — matchesFrom (this exhibit found a match)
 * and matchesTo (a later exhibit found this one as its match) — or a real
 * link would be silently missed depending on which side was investigated
 * first.
 *
 * Merges this exhibit's own custody history with every matched exhibit's
 * (across every other case that content has appeared in) into one
 * chronological timeline — the per-case Evidence tab only ever shows one
 * exhibit's own custody trail, never this cross-case picture.
 */
export async function getCrossCaseCustodyRollup(evidenceId: string): Promise<{
  entries: CustodyRollupEntry[];
  matchedExhibitCount: number;
}> {
  const [matchesFrom, matchesTo] = await Promise.all([
    db.evidenceMatch.findMany({ where: { evidenceId }, select: { matchedEvidenceId: true } }),
    db.evidenceMatch.findMany({ where: { matchedEvidenceId: evidenceId }, select: { evidenceId: true } }),
  ]);
  const matchedIds = Array.from(
    new Set([
      ...matchesFrom.map((m) => m.matchedEvidenceId),
      ...matchesTo.map((m) => m.evidenceId),
    ]),
  );

  const evidences = await db.evidence.findMany({
    where: { id: { in: [evidenceId, ...matchedIds] } },
    include: {
      case: { select: { id: true, title: true } },
      custodyTransfers: { include: { recordedBy: { select: { name: true } } } },
    },
  });

  const entries: CustodyRollupEntry[] = [];
  for (const ev of evidences) {
    for (const t of ev.custodyTransfers) {
      entries.push({
        id: t.id,
        evidenceId: ev.id,
        caseId: ev.case.id,
        caseTitle: ev.case.title,
        isSourceExhibit: ev.id === evidenceId,
        fromPerson: t.fromPerson,
        toPerson: t.toPerson,
        purpose: t.purpose,
        location: t.location,
        occurredAt: t.occurredAt,
        recordedByName: t.recordedBy.name,
        witness1Name: t.witness1Name,
        witness2Name: t.witness2Name,
      });
    }
  }
  entries.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

  return { entries, matchedExhibitCount: matchedIds.length };
}
