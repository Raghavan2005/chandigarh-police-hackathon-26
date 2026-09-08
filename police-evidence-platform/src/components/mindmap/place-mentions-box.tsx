"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseLocationMention } from "@/lib/mindmap-server";

const COLUMNS = 4;
const CELL_WIDTH = 230;
const CELL_HEIGHT = 40;

interface Pos {
  x: number;
  y: number;
}

/**
 * Draggable place-mention chips — same window-level pointer pattern already
 * proven on the case mind-map graph (mindmap-graph.tsx), not element-level
 * `setPointerCapture`: that alone was confirmed live to fail under a real
 * fast mouse/trackpad drag, since the cursor leaves a small chip before the
 * browser finishes routing capture to it. Listening on `window` instead
 * sees every pointermove/pointerup regardless of exactly which element the
 * cursor is physically over.
 *
 * Initial layout is a simple fixed grid (not measured against the real
 * container width) — deliberately simple for a "minimal box," and it
 * barely matters since dragging immediately overrides it anyway.
 */
export function PlaceMentionsBox({ mentions }: { mentions: CaseLocationMention[] }) {
  const [positions, setPositions] = useState<Pos[]>(() =>
    mentions.map((_, i) => ({ x: (i % COLUMNS) * CELL_WIDTH, y: Math.floor(i / COLUMNS) * CELL_HEIGHT })),
  );

  const dragIndexRef = useRef<number | null>(null);
  // Survives just long enough for the click event that fires right after
  // pointerup to check it — a chip is a real link (navigates to its
  // exhibit), and a drag-and-release is, to the DOM, also a click.
  const draggedRef = useRef(false);

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      const i = dragIndexRef.current;
      if (i === null) return;
      if (e.movementX !== 0 || e.movementY !== 0) draggedRef.current = true;
      setPositions((prev) => {
        const next = [...prev];
        next[i] = { x: next[i].x + e.movementX, y: next[i].y + e.movementY };
        return next;
      });
    }
    function handleUp() {
      dragIndexRef.current = null;
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  function startDrag(i: number) {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      dragIndexRef.current = i;
      draggedRef.current = false;
    };
  }

  function onClickCapture(e: React.MouseEvent) {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  }

  const rows = Math.ceil(mentions.length / COLUMNS);

  return (
    <div
      className="relative overflow-visible rounded-md border border-border-subtle bg-surface-sunken"
      style={{ height: rows * CELL_HEIGHT + 16, minHeight: CELL_HEIGHT + 16 }}
    >
      {mentions.map((m, i) => {
        const pos = positions[i];
        return (
          <a
            key={i}
            href={m.href}
            title={`${m.exhibitLabel} — "${m.quote}"`}
            onPointerDown={startDrag(i)}
            onClick={onClickCapture}
            onDragStart={(e) => e.preventDefault()}
            className={
              m.resolved
                ? "absolute inline-flex max-w-[210px] cursor-grab items-center gap-1 truncate whitespace-nowrap rounded-full border border-accent-primary/30 bg-accent-dim px-2 py-0.5 text-xs text-text-primary shadow-sm hover:opacity-80"
                : "absolute inline-flex max-w-[210px] cursor-grab items-center gap-1 truncate whitespace-nowrap rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-xs text-text-tertiary shadow-sm hover:opacity-80"
            }
            style={{ left: pos.x + 8, top: pos.y + 8, touchAction: "none" }}
          >
            {m.name} <span className="text-text-tertiary">— {m.sender ?? m.exhibitLabel}</span>
          </a>
        );
      })}
    </div>
  );
}
