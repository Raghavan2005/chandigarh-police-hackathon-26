import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCrossCaseCustodyRollup, getVaultEvidenceDetail } from "@/lib/vault-server";
import { getSession } from "@/lib/session";
import { writeAuditEntry } from "@/lib/audit";
import { EvidenceCard } from "@/components/investigation/evidence-card";
import { RetentionDialog } from "@/components/investigation/retention-dialog";
import { CrossCaseCustodyRollup } from "@/components/investigation/cross-case-custody-rollup";

/**
 * Single-exhibit view reached from the Evidence Vault (cross-case index),
 * not from a case page — same EvidenceCard the per-case Evidence tab uses
 * (evidence-tabs.tsx), so every detection/fusion/custody panel that works
 * there works here unchanged. Read-only entry point: EvidenceCard's own
 * actions (override, custody transfer, re-investigate, ...) are unaffected
 * and still write to the exhibit's real case.
 */
export default async function VaultEvidencePage(props: {
  params: Promise<{ evidenceId: string }>;
}) {
  const { evidenceId } = await props.params;

  const session = await getSession();
  if (!session) return null; // (app)/layout.tsx already redirects unauthenticated users before this renders.

  const result = await getVaultEvidenceDetail(evidenceId);
  if (!result) notFound();
  const { evidence, exhibitNumber } = result;
  const custodyRollup = await getCrossCaseCustodyRollup(evidenceId);

  // Vault views get their own VIEWED entry, same action type the per-case
  // API route already writes on GET /api/cases/:caseId — nothing else to
  // be atomic with, so the standalone (non-tx) writer is correct here.
  await writeAuditEntry({
    caseId: evidence.caseId,
    evidenceHash: evidence.sha256,
    actorId: session.userId,
    action: "VIEWED",
  });

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <div>
        <Link
          href="/vault"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
        >
          <ArrowLeft className="size-3.5" />
          Back to vault
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-text-tertiary">{evidence.sha256}</p>
            <h1 className="text-xl font-semibold text-text-primary">Exhibit {exhibitNumber}</h1>
          </div>
          <div className="flex gap-2">
            <RetentionDialog
              evidenceId={evidence.id}
              legalHold={evidence.legalHold}
              retentionUntil={evidence.retentionUntil}
            />
            <Link
              href={`/cases/${evidence.case.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <FolderKanban className="size-4" />
              View in case — {evidence.case.title}
            </Link>
          </div>
        </div>
      </div>

      <EvidenceCard
        caseId={evidence.case.id}
        sensitivityLevel={evidence.case.sensitivityLevel}
        evidence={evidence}
        exhibitNumber={exhibitNumber}
        derivedFromLabel={null}
      />

      <CrossCaseCustodyRollup
        entries={custodyRollup.entries}
        matchedExhibitCount={custodyRollup.matchedExhibitCount}
      />
    </div>
  );
}
