import { notFound } from "next/navigation";
import { caseById, auditLog as mockAuditLog, auditLogByCase } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseHistoryTable, type CaseHistoryRow } from "@/components/investigation/case-history-table";
import { getRealCase, getRealCaseAuditLog } from "@/lib/cases-server";

export default async function CaseHistoryPage(props: PageProps<"/cases/[caseId]/history">) {
  const { caseId } = await props.params;

  // Same real-DB-first, mock-fallback pattern as the propagation/report pages.
  const realCase = await getRealCase(caseId);
  if (realCase) {
    const auditLog = await getRealCaseAuditLog(caseId);
    const rows: CaseHistoryRow[] = [...auditLog].reverse().map((a) => ({
      id: a.id,
      timestamp: a.timestamp,
      actorName: a.actor?.name ?? null,
      action: a.action,
      evidenceHash: a.evidenceHash,
      device: a.device,
    }));

    return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
        <div>
          <p className="font-mono text-xs text-text-tertiary">{realCase.id}</p>
          <h1 className="text-xl font-semibold text-text-primary">Case history</h1>
          <p className="text-sm text-text-tertiary">
            Every logged action on this case&apos;s evidence, most recent first. This is a case-scoped view of the
            same audit trail the admin-only Audit Log covers system-wide — tamper verification against the
            hash-chain checkpoint file only runs there, since it depends on the full cross-case sequence.
          </p>
        </div>

        <Card className="border-border-subtle bg-surface shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-secondary">
              {realCase.title} — {rows.length} entr{rows.length === 1 ? "y" : "ies"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CaseHistoryTable rows={rows} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const caseData = caseById(caseId);
  if (!caseData) notFound();

  const mockRows: CaseHistoryRow[] = (auditLogByCase[caseId] ?? mockAuditLog).map((a) => ({
    id: a.id,
    timestamp: a.timestamp,
    actorName: a.actor,
    action: a.action,
    evidenceHash: a.evidenceHash,
    device: a.device,
  }));

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-6">
      <div>
        <p className="font-mono text-xs text-text-tertiary">{caseData.id}</p>
        <h1 className="text-xl font-semibold text-text-primary">Case history</h1>
        <p className="text-sm text-text-tertiary">Every logged action on this case&apos;s evidence.</p>
      </div>

      <Card className="border-border-subtle bg-surface shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">{caseData.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseHistoryTable rows={mockRows} />
        </CardContent>
      </Card>
    </div>
  );
}
