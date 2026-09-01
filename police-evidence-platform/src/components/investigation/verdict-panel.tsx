"use client";

import { motion } from "framer-motion";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import { ConfidenceMeter } from "@/components/shared/confidence-meter";
import type { CaseSummary } from "@/lib/types";

export function VerdictPanel({
  caseData,
  ready,
}: {
  caseData: CaseSummary;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-sunken p-4 text-center">
        <p className="text-xs text-text-tertiary">
          Verdict pending — waiting for evidence fusion to complete.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
        Verdict
      </p>
      <VerdictBadge verdict={caseData.verdict} size="lg" />
      <ConfidenceMeter confidence={caseData.confidence} verdict={caseData.verdict} />
      <p className="text-xs leading-relaxed text-text-secondary">
        {caseData.verdictExplanation ??
          "Facial-region inconsistency detected + no valid Content Credentials found + 4 near-duplicate matches in the evidence corpus."}
      </p>
    </motion.div>
  );
}
