import "server-only";
import { createHash } from "crypto";
import QRCode from "qrcode";
import type { getRealCase, getRealCaseAuditLog } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type AuditEntries = Awaited<ReturnType<typeof getRealCaseAuditLog>>;

/**
 * A real self-integrity check for the exported report itself — a genuine
 * gap for a platform whose whole pitch is tamper-evidence: the report.pdf/
 * report.json a court receives previously carried no way to verify that
 * specific copy matches the platform's current record. Deterministic over
 * the report's actual content (case particulars, per-exhibit verdicts/
 * overrides, and the audit chain's own last entryHash — which, by the
 * hash-chain property AuditLogEntry already implements, commits to the
 * entire history up to that point without needing to re-serialize every
 * row here). Deliberately excludes `generatedAt`: the same underlying data
 * viewed on-screen, exported as JSON, or exported as PDF at different
 * moments must hash identically, or the hash is useless for the "does this
 * copy still match the platform's record" check it exists for.
 *
 * Deliberately excludes VIEWED/EXPORTED audit entries from that chain
 * position, not just the whole audit log — caught live, not by inspection:
 * fetching report.json itself writes an EXPORTED entry, so a naive
 * "last entry in the whole log" hash changes every time someone re-checks
 * it, which would make a legitimate, unmodified report look tampered with
 * on every re-verification. Only substantive actions (upload, analysis,
 * override, assignment, custody transfer) move this hash — merely viewing
 * or exporting the report must not.
 */
export function computeReportIntegrityHash(caseData: RealCase, auditLog: AuditEntries): string {
  const substantiveAuditLog = auditLog.filter((a) => a.action !== "VIEWED" && a.action !== "EXPORTED");
  const stable = {
    caseId: caseData.id,
    firNumber: caseData.firNumber,
    firDate: caseData.firDate,
    policeStation: caseData.policeStation,
    district: caseData.district,
    title: caseData.title,
    offenceSections: caseData.offenceSections,
    complainantName: caseData.complainantName,
    accusedDetails: caseData.accusedDetails,
    investigator: caseData.investigator.name,
    investigatorRank: caseData.investigatorRank,
    investigatorBadgeNo: caseData.investigatorBadgeNo,
    forwardingOfficerName: caseData.forwardingOfficerName,
    forwardedAt: caseData.forwardedAt,
    evidence: caseData.evidence.map((ev) => ({
      id: ev.id,
      sha256: ev.sha256,
      verdict: ev.fusionVerdict?.verdict ?? null,
      confidence: ev.fusionVerdict?.confidence ?? null,
      overridesCount: ev.overrides.length,
      forensicExpert: ev.forensicExpert ? ev.forensicExpert.labRef : null,
      custodyTransferCount: ev.custodyTransfers.length,
    })),
    substantiveAuditEntryCount: substantiveAuditLog.length,
    lastSubstantiveAuditEntryHash:
      substantiveAuditLog.length > 0 ? substantiveAuditLog[substantiveAuditLog.length - 1].entryHash : null,
  };
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}

/**
 * Small verification QR for the printed report — encodes plain, human-
 * readable text (case ID + the same integrity hash printed in the footer),
 * not a URL: this platform has no public verification portal to point at,
 * and a QR encoding a broken/localhost link would be worse than no QR at
 * all. Scanning it just surfaces the same values a reader can already
 * cross-check against report.json, matching the verification convention on
 * real government documents without fabricating a live service.
 */
export async function generateVerificationQrDataUrl(caseId: string, integrityHash: string): Promise<string> {
  const text = `PRAMANA REPORT VERIFICATION\nCase: ${caseId}\nSHA-256: ${integrityHash}`;
  return QRCode.toDataURL(text, { width: 160, margin: 1, errorCorrectionLevel: "M" });
}
