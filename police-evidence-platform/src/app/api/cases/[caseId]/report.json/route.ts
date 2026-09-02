import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { getRealCase, getRealCaseAuditLog } from "@/lib/cases-server";
import { computeReportIntegrityHash } from "@/lib/report-hash";

/**
 * GET /api/cases/:id/report.json — named explicitly in
 * PS4_MVP_BUILD_PLAN.md §5's API surface. Single source of truth for the
 * JSON export payload (RealReportPreview's "Export JSON" button fetches
 * this instead of re-building the same shape client-side, so there's one
 * place this can drift out of sync with the on-screen report, not two).
 *
 * Also closes a real Phase 2 gap: "Audit log wired to every real action"
 * names EXPORTED as one of the tracked actions, but nothing ever wrote one
 * — export previously had no server round-trip at all. report.pdf (Phase 3)
 * writes its own EXPORTED entry the same way for the PDF path.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { caseId } = await params;
  const caseData = await getRealCase(caseId);
  if (!caseData) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const auditLog = await getRealCaseAuditLog(caseId);

  await writeAuditEntry({
    caseId,
    actorId: session.userId,
    action: "EXPORTED",
    device: request.headers.get("user-agent") ?? undefined,
  });

  const verdictCounts: Record<string, number> = {};
  for (const ev of caseData.evidence) {
    const key = ev.fusionVerdict?.verdict ?? "PENDING";
    verdictCounts[key] = (verdictCounts[key] ?? 0) + 1;
  }

  return NextResponse.json({
    case: {
      id: caseData.id,
      firNumber: caseData.firNumber,
      firDate: caseData.firDate,
      policeStation: caseData.policeStation,
      district: caseData.district,
      title: caseData.title,
      summary: caseData.summary,
      evidenceKind: caseData.evidenceKind,
      status: caseData.status,
      sensitivityLevel: caseData.sensitivityLevel,
      investigator: caseData.investigator.name,
      investigatorRank: caseData.investigatorRank,
      investigatorBadgeNo: caseData.investigatorBadgeNo,
      investigatorMobile: caseData.investigatorMobile,
      offenceSections: caseData.offenceSections,
      complainantName: caseData.complainantName,
      complainantContact: caseData.complainantContact,
      accusedDetails: caseData.accusedDetails,
      courtJurisdiction: caseData.courtJurisdiction,
      gdEntryNumber: caseData.gdEntryNumber,
      dispatchNumber: caseData.dispatchNumber,
      forwardingOfficerName: caseData.forwardingOfficerName,
      forwardingOfficerRank: caseData.forwardingOfficerRank,
      forwardingOfficerBadgeNo: caseData.forwardingOfficerBadgeNo,
      forwardingRemarks: caseData.forwardingRemarks,
      forwardedAt: caseData.forwardedAt,
      openedAt: caseData.openedAt,
    },
    evidence: caseData.evidence.map((ev) => ({
      id: ev.id,
      sha256: ev.sha256,
      deviceIdentifier: ev.deviceIdentifier,
      casePropertyNumber: ev.casePropertyNumber,
      mimeType: ev.mimeType,
      uploadedBy: ev.uploadedBy.name,
      uploadedAt: ev.uploadedAt,
      declarantName: ev.declarantName,
      declarantRole: ev.declarantRole,
      declarantOrg: ev.declarantOrg,
      courtDirectionRef: ev.courtDirectionRef,
      metadata: ev.metadataResult,
      detection: ev.detectionResult,
      provenance: ev.provenanceResult,
      verdict: ev.fusionVerdict,
      overrides: ev.overrides,
      forensicExpert: ev.forensicExpert,
      custodyTransfers: ev.custodyTransfers,
    })),
    auditLog: auditLog.map((a) => ({
      timestamp: a.timestamp,
      actor: a.actor?.name ?? "system",
      action: a.action,
      evidenceHash: a.evidenceHash,
      device: a.device,
      entryHash: a.entryHash,
    })),
    executiveSummary: {
      exhibitCount: caseData.evidence.length,
      verdictCounts,
    },
    generatedAt: new Date().toISOString(),
    // Deterministic over the report's actual content (excludes generatedAt)
    // — see report-hash.ts. Re-fetching this endpoint and recomputing lets
    // anyone confirm a printed/exported copy still matches the platform's
    // current record.
    integrityHash: computeReportIntegrityHash(caseData, auditLog),
    legalStatus:
      "This is a system-generated draft correctly structured to satisfy Section 63, Bharatiya Sakshya Adhiniyam, 2023 (BSA) evidentiary requirements. It attains legal validity only once physically or digitally signed/executed by the investigating officer and, where applicable, countersigned by the certifying forensic expert. The software does not itself certify anything.",
  });
}
