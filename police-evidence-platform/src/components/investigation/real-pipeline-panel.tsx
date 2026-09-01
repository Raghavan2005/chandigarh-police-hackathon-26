import { Check, Clock3 } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { computePipelineStatus } from "@/lib/pipeline-status";
import type { getRealCase } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type Evidence = RealCase["evidence"][number];

/**
 * Real, static equivalent of the old mock PipelinePanel — deliberately NOT
 * a timed animation, because /investigate runs as one atomic call with no
 * incremental progress events to animate honestly (see
 * PS4_BUILD_STATUS.md's "PipelinePanel not reused" blocker). Instead this
 * renders the actual DB state as a checklist: a step is "done" the moment
 * its real result row exists, each with real numbers, no OSINT/propagation
 * steps since those aren't implemented capabilities yet. Step logic itself
 * lives in lib/pipeline-status.ts, shared with the pipeline-status API
 * route so both compute the exact same thing.
 */
export function RealPipelinePanel({ evidence }: { evidence: Evidence }) {
  const { steps, totalMs } = computePipelineStatus(evidence);

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Analysis pipeline</p>
        {totalMs !== null && (
          <span className="font-mono text-[10px] text-text-tertiary">completed in {formatDuration(totalMs)}</span>
        )}
      </div>

      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-14px)] w-px",
                    step.done ? "bg-accent-primary" : "bg-border-subtle",
                  )}
                />
              )}
              <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-surface">
                {step.done ? (
                  <span className="flex size-6 items-center justify-center rounded-full border border-accent-primary bg-accent-primary text-white">
                    <Check className="size-3.5" />
                  </span>
                ) : (
                  <span className="flex size-6 items-center justify-center rounded-full border border-border-subtle text-text-tertiary">
                    <Clock3 className="size-3.5" />
                  </span>
                )}
              </span>
              <div className="flex-1 pt-0.5">
                <p className={cn("text-sm", step.done ? "text-text-primary" : "text-text-tertiary")}>{step.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-text-tertiary">{step.detail}</p>
                {step.metrics && (
                  <dl className="mt-2 flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-sunken px-2.5 py-2">
                    {step.metrics.map((m) => (
                      <div key={m.label} className="flex items-center justify-between gap-3">
                        <dt className="text-[10px] text-text-tertiary">{m.label}</dt>
                        <dd className="shrink-0 text-right font-mono text-[10px] text-text-secondary">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
