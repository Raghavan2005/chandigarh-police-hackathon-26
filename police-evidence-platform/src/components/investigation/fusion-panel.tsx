"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import type { FusionSignal, Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Takes signals/verdict/confidence as props rather than looking them up
 * from mock-data.ts internally (as this component used to) — decoupling it
 * from any one data source is what actually makes it reusable, not just
 * "it's a presentational component" in the abstract. The mock demo case
 * page now passes its own fusionSignalsByCase[...] lookup in explicitly.
 *
 * Not currently used for real cases — the real Evidence Fusion algorithm
 * (PS4_MVP_BUILD_PLAN.md §4) is coverage-based capping, not a weighted sum
 * of N signals to 100%, so this component's "weight" bars would visually
 * misrepresent how a real verdict was actually reached. See
 * RealFusionSignals for the honest real-case equivalent.
 */
export function FusionPanel({
  signals,
  verdict,
  confidence,
}: {
  signals: FusionSignal[];
  verdict: Verdict;
  confidence: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-text-secondary">
        Every signal below is computed independently, then weighted into a
        single explainable verdict — the model score is one input among{" "}
        {signals.length}, never the whole story.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_220px]">
        <div className="flex flex-col gap-2.5">
          {signals.map((signal, i) => {
            const isOpen = expandedId === signal.id;
            return (
              <motion.div
                key={signal.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "rounded-md border border-border-subtle bg-surface px-3 py-2.5",
                  signal.evidence && "cursor-pointer transition-colors hover:border-border-strong",
                  isOpen && "border-accent-primary/40",
                )}
                onClick={() =>
                  signal.evidence &&
                  setExpandedId((prev) => (prev === signal.id ? null : signal.id))
                }
              >
                <div className="flex items-center gap-3">
                  <StatusDot status={signal.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary">{signal.label}</p>
                      <span className="font-mono text-xs text-text-tertiary">
                        {signal.weight}% weight
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-text-tertiary">{signal.detail}</p>
                  </div>
                  <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-border-subtle">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        signal.status === "critical" && "bg-status-critical",
                        signal.status === "warning" && "bg-status-warning",
                        signal.status === "safe" && "bg-status-safe",
                        signal.status === "neutral" && "bg-status-neutral",
                      )}
                      style={{ width: `${signal.weight * 2.4}%` }}
                    />
                  </div>
                  {signal.evidence && (
                    <ChevronDown
                      className={cn(
                        "size-3.5 shrink-0 text-text-tertiary transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && signal.evidence && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex items-center gap-3 border-t border-border-subtle pt-3">
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border-subtle">
                          <Image src={signal.evidence} alt="" fill className="object-cover" />
                        </div>
                        <p className="text-[11px] leading-snug text-text-secondary">
                          {signal.evidenceCaption}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-border-strong to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-3 self-start rounded-lg border border-accent-primary/30 bg-accent-dim p-5 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Fused verdict
          </p>
          <VerdictBadge verdict={verdict} size="lg" />
          <p className="font-mono text-2xl font-semibold text-text-primary">
            {confidence}%
          </p>
          <p className="text-[11px] leading-snug text-text-tertiary">
            Weighted across {signals.length} independent signals
          </p>
        </motion.div>
      </div>
    </div>
  );
}
