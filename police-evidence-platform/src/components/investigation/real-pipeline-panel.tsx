import { Check, Clock3 } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import type { getRealCase } from "@/lib/cases-server";

type RealCase = NonNullable<Awaited<ReturnType<typeof getRealCase>>>;
type Evidence = RealCase["evidence"][number];

interface Step {
  id: string;
  label: string;
  done: boolean;
  detail: string;
  metrics?: { label: string; value: string }[];
}

/**
 * Real, static equivalent of the old mock PipelinePanel — deliberately NOT
 * a timed animation, because /investigate runs as one atomic call with no
 * incremental progress events to animate honestly (see
 * PS4_BUILD_STATUS.md's "PipelinePanel not reused" blocker). Instead this
 * renders the actual DB state as a checklist: a step is "done" the moment
 * its real result row exists, each with real numbers, no OSINT/propagation
 * steps since those aren't implemented capabilities yet.
 */
export function RealPipelinePanel({ evidence }: { evidence: Evidence }) {
  const matchCount = evidence.matchesFrom.length + evidence.corpusMatches.length;

  const steps: Step[] = [
    {
      id: "metadata",
      label: "Metadata extracted",
      done: Boolean(evidence.metadataResult),
      detail: "Container, resolution, codec, and encoder signature read from the uploaded file.",
      metrics: evidence.metadataResult
        ? [
            { label: "Container", value: evidence.metadataResult.container ?? "—" },
            { label: "Resolution", value: evidence.metadataResult.resolution ?? "—" },
            ...(evidence.metadataResult.encoderSignature
              ? [{ label: "Encoder signature", value: evidence.metadataResult.encoderSignature }]
              : []),
          ]
        : undefined,
    },
    {
      id: "detection",
      label: "Manipulation detection",
      done: Boolean(evidence.detectionResult),
      detail: "ML classifier scores the file for manipulation/synthesis artifacts.",
      metrics: evidence.detectionResult
        ? [
            {
              label: "Raw classifier score",
              value: `${Math.round(evidence.detectionResult.manipulationProbability)}%`,
            },
            { label: "Model", value: `${evidence.detectionResult.modelName} ${evidence.detectionResult.modelVersion}` },
          ]
        : undefined,
    },
    {
      id: "provenance",
      label: "Provenance / C2PA check",
      done: Boolean(evidence.provenanceResult),
      detail: "Checked for a valid Content Credential (C2PA) manifest and signing chain.",
      metrics: evidence.provenanceResult
        ? [
            { label: "C2PA manifest found", value: evidence.provenanceResult.c2paPresent ? "Yes" : "No" },
            ...(evidence.provenanceResult.c2paPresent
              ? [{ label: "Manifest valid", value: evidence.provenanceResult.c2paValid ? "Yes" : "No" }]
              : []),
          ]
        : undefined,
    },
    {
      id: "matching",
      // Runs transactionally alongside fusion in the same /investigate
      // call, so "done" tracks fusionVerdict rather than a result row of
      // its own — there's no separate MatchingResult table.
      label: "Hash / cross-case matching",
      done: Boolean(evidence.fusionVerdict),
      detail: "Perceptual hash checked against the seeded corpus and every other case's evidence.",
      metrics: evidence.fusionVerdict ? [{ label: "Matches found", value: String(matchCount) }] : undefined,
    },
    {
      id: "fusion",
      label: "Evidence fusion",
      done: Boolean(evidence.fusionVerdict),
      detail: "Classifier score capped by how many signals actually corroborate it — not a weighted average.",
      metrics: evidence.fusionVerdict
        ? [
            { label: "Signals corroborating", value: `${evidence.fusionVerdict.coverageCount} / 3` },
            { label: "Verdict", value: evidence.fusionVerdict.verdict },
            { label: "Confidence", value: `${evidence.fusionVerdict.confidence}%` },
          ]
        : undefined,
    },
  ];

  const totalMs = evidence.fusionVerdict
    ? evidence.fusionVerdict.computedAt.getTime() - evidence.uploadedAt.getTime()
    : null;

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
