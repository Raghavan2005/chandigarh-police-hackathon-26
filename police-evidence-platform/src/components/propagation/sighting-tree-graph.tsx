import { Database, Flag, GitCompareArrows } from "lucide-react";
import { formatDateOnly, formatTimestamp } from "@/lib/utils";
import type { EvidencePropagation, PropagationSighting } from "@/lib/propagation-server";

const KIND_ICON = { origin: Flag, "cross-case": GitCompareArrows, corpus: Database } as const;
const KIND_COLOR: Record<PropagationSighting["kind"], string> = {
  origin: "var(--accent-primary)",
  "cross-case": "var(--status-warning)",
  corpus: "var(--status-safe)",
};

const ROW_HEIGHT = 52;
const ROOT_X = 60;
const CHILD_X = 320;
const NODE_R = 16;

/**
 * Real node-link graph of this evidence item's connections — this case's
 * own upload as the root, every real cross-case/corpus match as a child,
 * connected by a line. Structurally a tree, not a chronological timeline
 * (that's what the list below and the map above already show) — always
 * rooted at "this case," regardless of which sighting happened earliest.
 * Same real EvidencePropagation data as the map/list, just laid out as a
 * graph instead of plotted geographically or listed chronologically — no
 * separate data source, nothing invented per node.
 */
export function SightingTreeGraph({ propagation }: { propagation: EvidencePropagation }) {
  const root = propagation.sightings.find((s) => s.kind === "origin");
  const children = propagation.sightings.filter((s) => s.kind !== "origin");

  if (!root) return null;

  const height = Math.max(ROW_HEIGHT, children.length * ROW_HEIGHT + 16);
  const rootY = height / 2;
  const width = CHILD_X + 220;

  if (children.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border-subtle p-3 text-xs text-text-tertiary">
        <Flag className="size-3.5 shrink-0" style={{ color: KIND_COLOR.origin }} />
        Only this case&apos;s own upload — no cross-case or corpus matches to graph yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-sunken">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[520px]" style={{ height }}>
        {children.map((s, i) => {
          const y = ROW_HEIGHT / 2 + i * ROW_HEIGHT + 8;
          const midX = (ROOT_X + CHILD_X) / 2;
          return (
            <path
              key={`edge-${s.id}`}
              d={`M ${ROOT_X} ${rootY} C ${midX} ${rootY}, ${midX} ${y}, ${CHILD_X} ${y}`}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth={1.5}
            />
          );
        })}

        <g>
          <circle cx={ROOT_X} cy={rootY} r={NODE_R} fill="var(--surface-raised)" stroke={KIND_COLOR.origin} strokeWidth={2} />
          <foreignObject x={ROOT_X - 8} y={rootY - 8} width={16} height={16}>
            <Flag className="size-4" style={{ color: KIND_COLOR.origin }} />
          </foreignObject>
          <text x={ROOT_X} y={rootY + NODE_R + 14} textAnchor="middle" className="fill-[var(--text-secondary)] text-[10px] font-medium">
            This case
          </text>
        </g>

        {children.map((s, i) => {
          const y = ROW_HEIGHT / 2 + i * ROW_HEIGHT + 8;
          const Icon = KIND_ICON[s.kind];
          return (
            <a key={s.id} href={`#sighting-${s.id}`}>
              <circle cx={CHILD_X} cy={y} r={NODE_R - 3} fill="var(--surface-raised)" stroke={KIND_COLOR[s.kind]} strokeWidth={1.5} />
              <foreignObject x={CHILD_X - 6} y={y - 6} width={12} height={12}>
                <Icon className="size-3" style={{ color: KIND_COLOR[s.kind] }} />
              </foreignObject>
              <text x={CHILD_X + NODE_R + 6} y={y - 3} className="fill-[var(--text-primary)] text-[11px] font-medium">
                {s.label}
              </text>
              <text x={CHILD_X + NODE_R + 6} y={y + 11} className="fill-[var(--text-tertiary)] text-[10px]">
                {s.similarity !== null ? `${Math.round(s.similarity * 100)}% similar` : formatDateOnly(s.timestamp)}
              </text>
              <title>{`${s.label} — ${formatTimestamp(s.timestamp)}`}</title>
            </a>
          );
        })}
      </svg>
    </div>
  );
}
