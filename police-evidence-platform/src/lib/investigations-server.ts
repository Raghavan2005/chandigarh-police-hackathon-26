import "server-only";
import { db } from "@/lib/db";

/**
 * Server Component data access for Investigations — queries Prisma
 * directly, same reasoning as cases-server.ts (a Server Component calling
 * its own /api/investigations route over HTTP would just be a round trip
 * to itself; that route still exists for client components/programmatic
 * callers).
 */
export interface InvestigationSummary {
  id: string;
  title: string;
  status: string;
  createdByName: string;
  createdAt: Date;
  linkedCaseCount: number;
}

export async function listInvestigations(): Promise<InvestigationSummary[]> {
  const investigations = await db.investigation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      cases: { where: { unlinkedAt: null } },
    },
  });
  return investigations.map((inv) => ({
    id: inv.id,
    title: inv.title,
    status: inv.status,
    createdByName: inv.createdBy.name,
    createdAt: inv.createdAt,
    linkedCaseCount: inv.cases.length,
  }));
}

export async function getInvestigation(investigationId: string) {
  return db.investigation.findUnique({
    where: { id: investigationId },
    include: {
      createdBy: { select: { name: true } },
      cases: {
        orderBy: { linkedAt: "asc" },
        include: {
          case: { select: { id: true, title: true, firNumber: true, status: true } },
          linkedBy: { select: { name: true } },
          unlinkedBy: { select: { name: true } },
        },
      },
      actors: {
        orderBy: { addedAt: "asc" },
        include: {
          addedBy: { select: { name: true } },
          removedBy: { select: { name: true } },
        },
      },
    },
  });
}

export interface InvestigationTimelineEntry {
  id: number;
  caseId: string;
  caseTitle: string;
  isCaseActivelyLinked: boolean;
  actorName: string | null;
  action: string;
  timestamp: Date;
  evidenceHash: string | null;
}

/**
 * Phase C (Docs/Plan for the feature) — merges every linked case's own
 * AuditLogEntry rows into one chronological feed. Includes cases that were
 * later unlinked too (their audit history is still part of this
 * investigation's real timeline; isCaseActivelyLinked tells the UI which
 * is which so a stale link's entries aren't mistaken for current). Not a
 * new access boundary: a case's own audit trail is already visible to any
 * investigator via its report (getRealCaseAuditLog/report.json), so
 * merging several already-visible trails into one page doesn't expose
 * anything the global admin-only /audit page uniquely protects.
 */
export async function getInvestigationTimeline(investigationId: string): Promise<InvestigationTimelineEntry[]> {
  const investigation = await db.investigation.findUnique({
    where: { id: investigationId },
    include: { cases: { include: { case: { select: { id: true, title: true } } } } },
  });
  if (!investigation) return [];

  const caseIds = Array.from(new Set(investigation.cases.map((c) => c.caseId)));
  const activeCaseIds = new Set(investigation.cases.filter((c) => !c.unlinkedAt).map((c) => c.caseId));
  const caseTitleById = new Map(investigation.cases.map((c) => [c.caseId, c.case.title]));

  const entries = await db.auditLogEntry.findMany({
    where: { caseId: { in: caseIds } },
    orderBy: { id: "asc" },
    include: { actor: { select: { name: true } } },
  });

  return entries.map((e) => ({
    id: e.id,
    caseId: e.caseId,
    caseTitle: caseTitleById.get(e.caseId) ?? e.caseId,
    isCaseActivelyLinked: activeCaseIds.has(e.caseId),
    actorName: e.actor?.name ?? null,
    action: e.action,
    timestamp: e.timestamp,
    evidenceHash: e.evidenceHash,
  }));
}
