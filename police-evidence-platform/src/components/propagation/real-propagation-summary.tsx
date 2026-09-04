import Link from "next/link";
import { Database, ExternalLink, Flag, GitCompareArrows, MapPin } from "lucide-react";
import { formatDuration, formatTimestamp } from "@/lib/utils";
import type { EvidencePropagation } from "@/lib/propagation-server";
import { SightingThumbnail } from "@/components/propagation/sighting-thumbnail";
import { SightingTreeGraph } from "@/components/propagation/sighting-tree-graph";

const KIND_ICON = { origin: Flag, "cross-case": GitCompareArrows, corpus: Database } as const;
const KIND_LABEL = { origin: "Uploaded here", "cross-case": "Matches another case", corpus: "Matches seeded corpus" } as const;
const MATCH_TYPE_LABEL = { sha256_exact: "Exact file match", phash_near: "Near-duplicate (visual)" } as const;

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
  const allSightings = evidence.flatMap((ev) => ev.sightings);
  const crossCaseSightings = allSightings.filter((s) => s.kind === "cross-case");
  const corpusSightings = allSightings.filter((s) => s.kind === "corpus");
  const linkedCases = new Set(crossCaseSightings.map((s) => s.label));

  const stats = [
    { label: "Evidence items", value: String(evidence.length) },
    { label: "Cross-case matches", value: String(crossCaseSightings.length) },
    { label: "Other cases linked", value: String(linkedCases.size) },
    { label: "Corpus matches", value: String(corpusSightings.length) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {evidence.length === 0 && <p className="text-sm text-text-tertiary">No evidence on this case yet.</p>}

      {evidence.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border-subtle bg-surface p-3">
              <p className="text-[11px] text-text-tertiary">{stat.label}</p>
              <p className="mt-1 font-mono text-lg font-semibold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

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

          <div className="mb-3">
            <SightingTreeGraph propagation={ev} />
          </div>

          <ol className="flex flex-col gap-2">
            {ev.sightings.map((s, i) => {
              const Icon = KIND_ICON[s.kind];
              return (
                <li
                  key={s.id}
                  id={`sighting-${s.id}`}
                  className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-sunken px-3 py-2 text-xs scroll-mt-4"
                >
                  <span
                    className={
                      "flex size-6 shrink-0 items-center justify-center rounded-full border " +
                      (i === 0 ? "border-accent-primary text-accent-primary" : "border-border-subtle text-text-tertiary")
                    }
                  >
                    <Icon className="size-3.5" />
                  </span>

                  {s.thumbnail?.kind === "gated" && (
                    <SightingThumbnail
                      caseId={s.thumbnail.caseId}
                      evidenceId={s.thumbnail.evidenceId}
                      mimeType={s.thumbnail.mimeType}
                      sensitivityLevel={s.thumbnail.sensitivityLevel}
                    />
                  )}
                  {s.thumbnail?.kind === "static" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.thumbnail.src}
                      alt=""
                      className="size-12 shrink-0 rounded-md border border-border-subtle bg-black object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    {s.linkHref ? (
                      <Link href={s.linkHref} className="font-medium text-accent-primary hover:underline">
                        {s.label}
                      </Link>
                    ) : s.sourceUrl ? (
                      <a
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-accent-primary hover:underline"
                      >
                        {s.label}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <span className="font-medium text-text-primary">{s.label}</span>
                    )}
                    <p className="text-[10px] text-text-tertiary">
                      {KIND_LABEL[s.kind]}
                      {s.matchType && ` · ${MATCH_TYPE_LABEL[s.matchType]}`}
                    </p>
                    {s.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-text-tertiary">
                        <MapPin className="size-3 shrink-0" />
                        {s.location.label}
                        {s.location.source === "ip-geo" ? " (approx.) — IP geolocation" : " — EXIF GPS"}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[10px] text-text-secondary">{formatTimestamp(s.timestamp)}</p>
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
