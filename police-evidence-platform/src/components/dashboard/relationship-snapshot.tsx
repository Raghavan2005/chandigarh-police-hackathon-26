import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_CASE_ID } from "@/lib/mock-data";

const MINI_NODES = [
  { x: 20, y: 60, label: "Telegram" },
  { x: 90, y: 25, label: "Telegram" },
  { x: 160, y: 55, label: "X" },
  { x: 230, y: 20, label: "X" },
  { x: 230, y: 90, label: "WhatsApp" },
  { x: 300, y: 55, label: "Facebook" },
];

const MINI_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 5],
];

export function RelationshipSnapshot() {
  return (
    <div className="flex flex-col gap-3">
      <svg viewBox="0 0 320 110" className="h-28 w-full">
        {MINI_EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={MINI_NODES[a].x}
            y1={MINI_NODES[a].y}
            x2={MINI_NODES[b].x}
            y2={MINI_NODES[b].y}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
          />
        ))}
        {MINI_NODES.map((n, i) => (
          <g key={i}>
            <circle
              cx={n.x}
              cy={n.y}
              r={i === 0 ? 6 : 5}
              fill={i === 0 ? "var(--accent-primary)" : "var(--surface-raised)"}
              stroke={i === 0 ? "var(--accent-primary)" : "var(--border-strong)"}
              strokeWidth={1.5}
            />
          </g>
        ))}
      </svg>
      <Link
        href={`/cases/${FEATURED_CASE_ID}/propagation`}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent-primary hover:text-accent-primary-hover"
      >
        View full propagation graph <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}
