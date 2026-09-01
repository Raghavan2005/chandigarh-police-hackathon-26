import Link from "next/link";
import { Database, Flag, GitCompareArrows } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { EvidencePropagation } from "@/lib/propagation-server";

const KIND_ICON = { origin: Flag, "cross-case": GitCompareArrows, corpus: Database } as const;
const KIND_LABEL = { origin: "Uploaded here", "cross-case": "Matches another case", corpus: "Matches seeded corpus" } as const;

/**
 * Real equivalent of the old mock PropagationGraph, for real cases only.
 * Shows exactly what the platform actually knows — real EvidenceMatch/
 * CorpusMatch rows, ordered by real timestamps — instead of a curated
 * multi-platform spread scenario with invented view counts and
 * screenshots. Most real evidence will show a single "Uploaded here"
 * entry and nothing else; that's the honest common case, not empty state
 * as failure.
 */
export function RealPropagationSummary({ evidence }: { evidence: EvidencePropagation[] }) {
  return (
    <div className="flex flex-col gap-6">
      {evidence.length === 0 && <p className="text-sm text-text-tertiary">No evidence on this case yet.</p>}
      {evidence.map((ev) => (
        <div key={ev.evidenceId} className="rounded-lg border border-border-subtle bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-xs text-text-tertiary">{ev.mimeType} · {ev.evidenceId.slice(0, 12)}…</p>
            <p className="text-xs text-text-tertiary">
              {ev.spreadWindowMs === null
                ? "No other sightings found"
                : `Spread window: ${formatDuration(ev.spreadWindowMs)}`}
            </p>
          </div>

          <ol className="flex flex-col gap-2">
            {ev.sightings.map((s, i) => {
              const Icon = KIND_ICON[s.kind];
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-sunken px-3 py-2 text-xs"
                >
                  <span
                    className={
                      "flex size-6 shrink-0 items-center justify-center rounded-full border " +
                      (i === 0 ? "border-accent-primary text-accent-primary" : "border-border-subtle text-text-tertiary")
                    }
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {s.linkHref ? (
                      <Link href={s.linkHref} className="font-medium text-accent-primary hover:underline">
                        {s.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-text-primary">{s.label}</span>
                    )}
                    <p className="text-[10px] text-text-tertiary">{KIND_LABEL[s.kind]}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[10px] text-text-secondary">{s.timestamp.toLocaleString()}</p>
                    {s.similarity !== null && (
                      <p className="text-[10px] text-text-tertiary">
                        {Math.round(s.similarity * 100)}% similar · Hamming {s.hammingDistance}
                      </p>
                    )}
                  </div>
                  {i === 0 && (
                    <span className="shrink-0 rounded-sm bg-accent-dim px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-accent-primary">
                      Earliest known
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
