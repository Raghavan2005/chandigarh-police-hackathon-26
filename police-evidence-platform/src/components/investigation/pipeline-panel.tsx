"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pipelineSteps,
  fusionSignals,
  fusionSignalsByCase,
  propagationNodes,
  propagationNodesByCase,
} from "@/lib/mock-data";
import type { CaseSummary, PipelineStepState } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { SearchEngineBadges } from "@/components/shared/search-engine-badges";
import { computeSpreadWindow, nodeTimeLabel } from "@/lib/propagation-utils";

export function PipelinePanel({
  caseData,
  states,
  activeIndex,
  running,
  onRestart,
}: {
  caseData: CaseSummary;
  states: PipelineStepState[];
  activeIndex: number;
  running: boolean;
  onRestart: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const signals = fusionSignalsByCase[caseData.id] ?? fusionSignals;

  const propNodes = propagationNodesByCase[caseData.id] ?? propagationNodes;
  const earliestNode = propNodes.find((n) => n.isEarliest) ?? propNodes[0];
  const platformsMatched = new Set(propNodes.map((n) => n.platform)).size;
  const spreadWindowLabel = computeSpreadWindow(propNodes);

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Analysis pipeline
        </p>
        <button
          type="button"
          onClick={onRestart}
          className={cn(
            buttonVariants({ variant: "ghost", size: "xs" }),
            "text-text-tertiary hover:text-text-primary",
          )}
        >
          <RotateCcw className="size-3" />
          Re-run
        </button>
      </div>

      <ol className="flex flex-col">
        {pipelineSteps.map((step, i) => {
          const state = states[i];
          const isLast = i === pipelineSteps.length - 1;
          const isOpen = state === "running" || expanded.has(step.id);
          const toggle = () => {
            if (state !== "done") return;
            setExpanded((prev) => {
              const next = new Set(prev);
              if (next.has(step.id)) {
                next.delete(step.id);
              } else {
                next.add(step.id);
              }
              return next;
            });
          };
          return (
            <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-14px)] w-px",
                    state === "done" ? "bg-accent-primary" : "bg-border-subtle",
                  )}
                />
              )}
              <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-surface">
                {state === "done" && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex size-6 items-center justify-center rounded-full border border-accent-primary bg-accent-primary text-white"
                  >
                    <Check className="size-3.5" />
                  </motion.span>
                )}
                {state === "running" && (
                  <span className="flex size-6 items-center justify-center rounded-full border border-accent-primary text-accent-primary">
                    <Loader2 className="size-3.5 animate-spin" />
                  </span>
                )}
                {state === "pending" && (
                  <span className="size-2 rounded-full bg-border-strong" />
                )}
              </span>

              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{
                  opacity: state === "pending" ? 0.5 : 1,
                  x: 0,
                }}
                transition={{ duration: 0.25 }}
                className="flex-1 pt-0.5"
              >
                <div
                  onClick={toggle}
                  className={cn(
                    "flex items-center gap-2",
                    state === "done" && "cursor-pointer",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm",
                      state === "pending" ? "text-text-tertiary" : "text-text-primary",
                    )}
                  >
                    {step.label}
                  </p>
                  {state === "done" && (
                    <span className="font-mono text-[10px] text-text-tertiary">
                      {(step.durationMs / 1000).toFixed(1)}s
                    </span>
                  )}
                  {state === "done" && (
                    <ChevronDown
                      className={cn(
                        "ml-auto size-3.5 shrink-0 text-text-tertiary transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  )}
                </div>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1 text-xs leading-snug text-text-tertiary"
                  >
                    {step.detail}
                  </motion.p>
                )}
                {step.metrics && isOpen && (
                  <motion.dl
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-2"
                  >
                    {(step.id === "fusion"
                      ? [
                          { label: "Signals combined", value: String(signals.length) },
                          { label: "Final confidence", value: `${caseData.confidence}%` },
                          { label: "Verdict", value: caseData.verdict },
                        ]
                      : step.id === "propagation"
                        ? [
                            {
                              label: "Earliest sighting",
                              value: `${earliestNode.platform.charAt(0).toUpperCase()}${earliestNode.platform.slice(1)} · ${nodeTimeLabel(earliestNode.timestamp)}`,
                            },
                            { label: "Platforms matched", value: String(platformsMatched) },
                            { label: "Spread window", value: spreadWindowLabel },
                          ]
                        : step.metrics
                    ).map((m) => (
                      <div key={m.label} className="flex items-center justify-between gap-3">
                        <dt className="text-[10px] text-text-tertiary">{m.label}</dt>
                        <dd className="shrink-0 text-right font-mono text-[10px] text-text-secondary">
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </motion.dl>
                )}
                {step.id === "osint" && isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <SearchEngineBadges done={state === "done"} />
                  </motion.div>
                )}
              </motion.div>
            </li>
          );
        })}
      </ol>

      {!running && activeIndex >= pipelineSteps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 rounded-md border border-accent-primary/30 bg-accent-dim px-3 py-2 text-xs text-text-secondary"
        >
          Pipeline complete — verdict fused from {signals.length} signals.
        </motion.div>
      )}
    </div>
  );
}
