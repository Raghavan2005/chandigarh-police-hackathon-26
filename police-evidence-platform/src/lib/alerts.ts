import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

// "CASE_ASSIGNED" isn't wired to any trigger yet — Case.investigatorId is
// only ever set once, to the creator themselves, at creation (grep
// confirms it before assuming otherwise: no reassignment route exists). An
// alert telling someone they assigned themselves a case they just created
// seconds ago is noise, not signal — exactly the alert-fatigue failure
// mode this feature's own plan warns against. Kept as a valid type for
// when a real case-reassignment feature exists, not implemented now.
export type AlertType = "CASE_ASSIGNED" | "MANIPULATED_VERDICT" | "CROSS_CASE_MATCH" | "AUDIT_INTEGRITY_FAILURE";
export type AlertSeverity = "critical" | "warning" | "info";

interface CreateAlertInput {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  caseId?: string;
  evidenceId?: string;
  targetUserId?: string; // omitted = platform-wide (AUDIT_INTEGRITY_FAILURE only)
}

/**
 * Alerts (Docs/Plan for the feature) — raised inline, in the same
 * transaction as the event they're about, same "there is no such thing as
 * X happening without its Y committing alongside it" rule the audit log
 * already follows. No push/websocket delivery — this is a pull model (the
 * /alerts page and the topbar bell's unread count), which is enough for
 * what this app actually has: no background job runner, no notification
 * infra, and adding either would be exactly the kind of architectural
 * complexity the hackathon engineering rules warn against for a feature
 * this size.
 */
export async function createAlertInTx(input: CreateAlertInput, tx: Prisma.TransactionClient) {
  return tx.alert.create({
    data: {
      type: input.type,
      severity: input.severity,
      message: input.message,
      caseId: input.caseId,
      evidenceId: input.evidenceId,
      targetUserId: input.targetUserId,
    },
  });
}

/**
 * Raises a platform-wide AUDIT_INTEGRITY_FAILURE alert (targetUserId left
 * unset — every admin sees it, per the global audit log's own admin-only
 * gate) the first time a broken hash chain is detected, then stays quiet
 * on every subsequent /audit view until an admin acknowledges it — without
 * this check, every page load would raise a fresh duplicate.
 */
export async function raiseAuditIntegrityFailureIfNew() {
  const existing = await db.alert.findFirst({
    where: { type: "AUDIT_INTEGRITY_FAILURE", acknowledgedAt: null },
  });
  if (existing) return;

  await db.alert.create({
    data: {
      type: "AUDIT_INTEGRITY_FAILURE",
      severity: "critical",
      message: "The tamper-evident audit log failed its own integrity check — the hash chain or its checkpoint cross-check no longer matches.",
    },
  });
}

/**
 * Raises the two evidence-analysis alert types (MANIPULATED_VERDICT,
 * CROSS_CASE_MATCH) after a fusion verdict is computed — called from both
 * investigate-image.ts and the video/audio path in investigate/route.ts,
 * which each independently upsert a FusionVerdict, so this is the one
 * place shared between them rather than duplicated in both.
 */
export async function raiseVerdictAlerts(
  input: {
    caseId: string;
    evidenceId: string;
    investigatorId: string;
    verdict: string;
    confidence: number;
    crossCaseMatchCount: number;
  },
  tx: Prisma.TransactionClient,
) {
  if (input.verdict === "MANIPULATED" || input.verdict === "AI_GENERATED") {
    await createAlertInTx(
      {
        type: "MANIPULATED_VERDICT",
        severity: "critical",
        message: `Evidence scored ${input.verdict} at ${input.confidence}% confidence.`,
        caseId: input.caseId,
        evidenceId: input.evidenceId,
        targetUserId: input.investigatorId,
      },
      tx,
    );
  }
  if (input.crossCaseMatchCount > 0) {
    await createAlertInTx(
      {
        type: "CROSS_CASE_MATCH",
        severity: "warning",
        message: `Found in ${input.crossCaseMatchCount} other case${input.crossCaseMatchCount === 1 ? "" : "s"} (hash/near-duplicate match).`,
        caseId: input.caseId,
        evidenceId: input.evidenceId,
        targetUserId: input.investigatorId,
      },
      tx,
    );
  }
}
