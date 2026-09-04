import "server-only";
import { db } from "@/lib/db";

/**
 * Server Component data access for real cases — queries Prisma directly
 * rather than self-fetching our own /api/cases route. That API route still
 * exists and is real (for client components / future external callers per
 * PS4_MVP_BUILD_PLAN.md §5); a Server Component calling it over HTTP would
 * just be an unnecessary round-trip to itself.
 *
 * Deliberately separate from `src/lib/mock-data.ts`'s CaseSummary — a real,
 * freshly created case has no verdict/confidence/thumbnail yet (Evidence
 * Fusion is Phase 2 scope), so forcing it through the mock-shaped type would
 * mean faking those fields. This type is honest about what a Phase 1 case
 * actually has.
 */
export interface RealCaseSummary {
  id: string;
  firNumber: string;
  title: string;
  evidenceKind: string;
  status: string;
  sensitivityLevel: string;
  investigatorName: string;
  openedAt: Date;
  evidenceCount: number;
}

export async function listRealCases(): Promise<RealCaseSummary[]> {
  const cases = await db.case.findMany({
    orderBy: { openedAt: "desc" },
    include: {
      investigator: { select: { name: true } },
      _count: { select: { evidence: true } },
    },
  });
  return cases.map((c) => ({
    id: c.id,
    firNumber: c.firNumber,
    title: c.title,
    evidenceKind: c.evidenceKind,
    status: c.status,
    sensitivityLevel: c.sensitivityLevel,
    investigatorName: c.investigator.name,
    openedAt: c.openedAt,
    evidenceCount: c._count.evidence,
  }));
}

export async function getRealCase(caseId: string) {
  return db.case.findUnique({
    where: { id: caseId },
    include: {
      investigator: { select: { name: true } },
      evidence: {
        orderBy: { uploadedAt: "desc" },
        include: {
          metadataResult: true,
          detectionResult: true,
          provenanceResult: true,
          fusionVerdict: true,
          forensicExpert: true,
          reverseImageSearchResults: true,
          imageDescriptionResult: true,
          transcriptResult: { include: { translations: true } },
          faceAnnotations: true,
          overrides: { orderBy: { timestamp: "desc" }, include: { overriddenBy: { select: { name: true } } } },
          uploadedBy: { select: { name: true } },
          // Cross-case search results (§2/§4) — matchesFrom is this
          // evidence -> other cases' evidence; matchedCaseId is
          // denormalized on EvidenceMatch (no direct Prisma relation to
          // Case), so the link target is just the case ID, not a fetched
          // title — that's still the primary identifier used everywhere
          // else in this app.
          matchesFrom: true,
          corpusMatches: { include: { corpusItem: true } },
          custodyTransfers: { orderBy: { occurredAt: "asc" }, include: { recordedBy: { select: { name: true } } } },
        },
      },
    },
  });
}

/** Chain-of-custody trail for a case's report — real AuditLogEntry rows,
 * oldest first, matching how the printed report reads chronologically. */
export async function getRealCaseAuditLog(caseId: string) {
  return db.auditLogEntry.findMany({
    where: { caseId },
    orderBy: { id: "asc" },
    include: { actor: { select: { name: true } } },
  });
}
