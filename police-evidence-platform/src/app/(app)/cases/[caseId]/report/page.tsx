import { notFound } from "next/navigation";
import { caseById } from "@/lib/mock-data";
import { ReportPreview } from "@/components/reports/report-preview";
import { RealReportPreview } from "@/components/reports/real-report-preview";
import { getRealCase, getRealCaseAuditLog } from "@/lib/cases-server";
import { computeReportIntegrityHash, generateVerificationQrDataUrl } from "@/lib/report-hash";

export default async function ReportPage(props: PageProps<"/cases/[caseId]/report">) {
  const { caseId } = await props.params;

  // Same real-DB-first, mock-fallback pattern as the case detail page —
  // real cases render from actual data, the curated demo cases keep
  // working exactly as before.
  const realCase = await getRealCase(caseId);
  if (realCase) {
    const auditLog = await getRealCaseAuditLog(caseId);
    const integrityHash = computeReportIntegrityHash(realCase, auditLog);
    const qrDataUrl = await generateVerificationQrDataUrl(realCase.id, integrityHash);
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6 print:p-0">
        <div className="print:hidden">
          <p className="font-mono text-xs text-text-tertiary">{realCase.id}</p>
          <h1 className="text-xl font-semibold text-text-primary">Evidence report</h1>
        </div>
        <RealReportPreview caseData={realCase} auditLog={auditLog} integrityHash={integrityHash} qrDataUrl={qrDataUrl} />
      </div>
    );
  }

  const caseData = caseById(caseId);
  if (!caseData) notFound();

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6 print:p-0">
      <div className="print:hidden">
        <p className="font-mono text-xs text-text-tertiary">{caseData.id}</p>
        <h1 className="text-xl font-semibold text-text-primary">Evidence report</h1>
      </div>
      <ReportPreview caseData={caseData} />
    </div>
  );
}
