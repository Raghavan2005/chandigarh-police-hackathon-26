"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Eye, Play, RotateCcw } from "lucide-react";
import { PlatformIcon } from "@/components/propagation/platform-icon";
import {
  propagationNodes as defaultNodes,
  propagationEdges as defaultEdges,
  propagationNodesByCase,
  propagationEdgesByCase,
} from "@/lib/mock-data";
import type { PropagationNode } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeSpreadWindow, nodeTimeLabel } from "@/lib/propagation-utils";

const DEFAULT_LAYOUT: Record<string, { x: number; y: number }> = {
  origin: { x: 70, y: 190 },
  n2: { x: 240, y: 90 },
  n3: { x: 420, y: 210 },
  n4: { x: 610, y: 90 },
  n6: { x: 610, y: 320 },
  n5: { x: 790, y: 190 },
};

const BAND_Y = [190, 100, 300, 140, 260, 90, 320];

function buildLayout(nodes: PropagationNode[], isDefaultSet: boolean) {
  if (isDefaultSet) return DEFAULT_LAYOUT;
  const w = 900;
  const marginX = 80;
  const step = nodes.length > 1 ? (w - marginX * 2) / (nodes.length - 1) : 0;
  const layout: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    layout[n.id] = { x: marginX + step * i, y: BAND_Y[i % BAND_Y.length] };
  });
  return layout;
}

const STEP_MS = 750;

export function PropagationGraph({ caseId }: { caseId: string }) {
  const [revealed, setRevealed] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const isDefaultSet = !propagationNodesByCase[caseId];
  const propagationNodes = propagationNodesByCase[caseId] ?? defaultNodes;
  const propagationEdges = propagationEdgesByCase[caseId] ?? defaultEdges;
  const LAYOUT = buildLayout(propagationNodes, isDefaultSet);

  const totalViews = propagationNodes.reduce((sum, n) => sum + n.views, 0);
  const platformCount = new Set(propagationNodes.map((n) => n.platform)).size;
  const spreadWindowLabel = computeSpreadWindow(propagationNodes);

  const deltaFor = (nodeId: string) => {
    const edge = propagationEdges.find((e) => e.to === nodeId);
    return edge?.label ?? "—";
  };

  const play = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setRevealed(0);
    propagationNodes.forEach((_, i) => {
      const t = window.setTimeout(() => setRevealed(i + 1), (i + 1) * STEP_MS);
      timers.current.push(t);
    });
  };

  useEffect(() => {
    const kickoff = window.setTimeout(play, 0);
    return () => {
      window.clearTimeout(kickoff);
      timers.current.forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const selectedNode = propagationNodes.find((n) => n.id === selected);
  const w = 900;
  const h = 380;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Sources tracked", value: String(propagationNodes.length) },
          { label: "Platforms", value: String(platformCount) },
          { label: "Total reach", value: totalViews.toLocaleString() },
          { label: "Spread window", value: spreadWindowLabel },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border-subtle bg-surface p-3"
          >
            <p className="text-[11px] text-text-tertiary">{stat.label}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-text-primary">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {propagationNodes.length} sources tracked, spanning{" "}
          <span className="font-mono text-text-primary">{spreadWindowLabel}</span>
        </p>
        <button onClick={play} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <RotateCcw className="size-3.5" />
          Replay
        </button>
      </div>

      <div className="relative w-full overflow-x-auto rounded-lg border border-border-subtle bg-surface-sunken">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[380px] w-full min-w-[720px]">
          {propagationEdges.map((edge, i) => {
            const from = LAYOUT[edge.from];
            const to = LAYOUT[edge.to];
            const fromIdx = propagationNodes.findIndex((n) => n.id === edge.from);
            const toIdx = propagationNodes.findIndex((n) => n.id === edge.to);
            const shown = revealed > Math.max(fromIdx, toIdx);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return (
              <g key={i}>
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--border-strong)"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
                {shown && (
                  <text
                    x={midX}
                    y={midY - 8}
                    textAnchor="middle"
                    className="fill-[var(--text-tertiary)] font-mono text-[10px]"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {propagationNodes.map((node, i) => {
            const pos = LAYOUT[node.id];
            const shown = revealed > i;
            return (
              <g
                key={node.id}
                onClick={() => setSelected(node.id)}
                className="cursor-pointer"
                opacity={shown ? 1 : 0}
                style={{ transition: "opacity 0.4s" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={node.isEarliest ? 26 : 22}
                  fill={
                    selected === node.id ? "var(--accent-dim)" : "var(--surface-raised)"
                  }
                  stroke={node.isEarliest ? "var(--accent-primary)" : "var(--border-strong)"}
                  strokeWidth={node.isEarliest ? 2.5 : 1.5}
                />
                <foreignObject x={pos.x - 9} y={pos.y - 9} width={18} height={18}>
                  <PlatformIcon
                    platform={node.platform}
                    className="size-[18px] text-text-secondary"
                  />
                </foreignObject>
                <text
                  x={pos.x}
                  y={pos.y + (node.isEarliest ? 44 : 40)}
                  textAnchor="middle"
                  className="fill-[var(--text-secondary)] text-[11px]"
                >
                  {nodeTimeLabel(node.timestamp)}
                </text>
                {node.isEarliest && (
                  <text
                    x={pos.x}
                    y={pos.y - 36}
                    textAnchor="middle"
                    className="fill-[var(--accent-primary)] font-mono text-[10px] font-semibold uppercase"
                  >
                    Earliest known
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-4 sm:flex-row"
          >
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md border border-border-subtle sm:w-40">
              <Image src={selectedNode.screenshot} alt="" fill className="object-cover" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised">
                  <PlatformIcon
                    platform={selectedNode.platform}
                    className="size-4 text-text-secondary"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{selectedNode.label}</p>
                  <p className="text-xs text-text-tertiary">
                    <span className="capitalize">{selectedNode.platform}</span> ·{" "}
                    {selectedNode.timestamp}
                  </p>
                </div>
                {selectedNode.isEarliest && (
                  <span className="ml-auto shrink-0 rounded-md border border-accent-primary/30 bg-accent-dim px-2 py-1 text-[11px] font-medium text-accent-primary">
                    Earliest known
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1">
                  <ExternalLink className="size-3" />
                  {selectedNode.url}
                </span>
                {selectedNode.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="size-3" />
                    {selectedNode.views.toLocaleString()} views
                  </span>
                )}
                {!selectedNode.isEarliest && (
                  <span className="font-mono">{deltaFor(selectedNode.id)} from prior source</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedNode && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border-subtle p-4 text-xs text-text-tertiary">
          <Play className="size-3.5" />
          Click any node above to inspect source details.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Full timeline
        </p>
        <div className="flex flex-col gap-1.5">
          {propagationNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelected(node.id)}
              className={cn(
                "flex items-center gap-3 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-left transition-colors hover:border-border-strong",
                selected === node.id && "border-accent-primary/40 bg-accent-dim",
              )}
            >
              <PlatformIcon platform={node.platform} className="size-3.5 shrink-0 text-text-secondary" />
              <span className="w-20 shrink-0 font-mono text-[11px] text-text-tertiary">
                {nodeTimeLabel(node.timestamp)}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
                {node.label}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-text-tertiary">
                {deltaFor(node.id)}
              </span>
              {node.views > 0 && (
                <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-text-tertiary">
                  <Eye className="size-3" />
                  {node.views.toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
