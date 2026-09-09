"use client";

import { useEffect, useRef, useState } from "react";
import type { MindMapNode, MindMapEdge, MindMapNodeKind } from "@/lib/mindmap-server";
import { cn, formatTimestamp } from "@/lib/utils";

const KIND_COLOR: Record<Exclude<MindMapNodeKind, "exhibit">, string> = {
  case: "var(--text-primary)",
  match: "var(--status-warning)",
  web_source: "var(--status-inconclusive)",
  person: "var(--accent-primary)",
  organization: "var(--status-warning)",
  location: "var(--status-safe)",
  other: "var(--text-tertiary)",
};

// "Person" deliberately has no "(AI-inferred)" suffix, unlike the other
// entity kinds — a person node can now be a real, structural fact (a chat's
// actual participants, computed with zero LLM involvement) OR an AI-
// inferred entity, sometimes both merged into one node. "other" has the
// same duality: normally an AI-inferred miscellaneous entity, but also used
// structurally for a chat's own "+N more participants" overflow node (see
// mindmap-server.ts's addChatParticipantGraph). Which one a given node
// actually is comes from its own `origin` (shown per-node in the hover card
// below and via the dashed-vs-solid ring here), not a blanket label that
// would be actively false for either case.
const KIND_LABEL: Record<MindMapNodeKind, string> = {
  case: "Case",
  exhibit: "Exhibit (colored by verdict)",
  match: "Internal match (corpus/cross-case/reference)",
  web_source: "External web source",
  person: "Person",
  organization: "Organization (AI-inferred)",
  location: "Location (AI-inferred)",
  other: "Other",
};

function exhibitColor(detail: string): string {
  if (detail.includes("MANIPULATED") || detail.includes("AI_GENERATED")) return "var(--status-critical)";
  if (detail.includes("AUTHENTIC")) return "var(--status-safe)";
  if (detail.includes("INCONCLUSIVE")) return "var(--status-inconclusive)";
  return "var(--status-neutral)"; // not yet investigated
}

function nodeColor(node: MindMapNode): string {
  return node.kind === "exhibit" ? exhibitColor(node.detail) : KIND_COLOR[node.kind];
}

function nodeRadius(node: MindMapNode): number {
  if (node.kind === "case") return 15;
  if (node.kind === "exhibit") return 11;
  return 7;
}

interface Positioned {
  node: MindMapNode;
  x: number;
  y: number;
  angle: number;
}

const RING1_RADIUS = 220;

/**
 * Real hierarchical radial layout, not a naive evenly-spaced circle: the
 * case sits at the origin, exhibits ring around it ordered chronologically
 * by real upload time (so angular position IS the timeline), and each
 * exhibit's own structural/AI-inferred children (matches, web sources,
 * mentioned entities) fan out on their own local circle centered on that
 * exhibit. Entity-to-entity relationship edges then connect across
 * clusters directly. No layout library — same "hand-rolled SVG, plain
 * math" approach already used by this app's propagation/sighting graphs.
 *
 * Deliberately works in fixed, absolute units (not scaled by node count or
 * fan-out) and is centered on (0, 0) rather than a pre-guessed canvas
 * center — the actual canvas is fit to whatever bounding box these
 * positions produce afterward (see boundingBoxOf below), so a lopsided
 * case (one exhibit fanning ten sources in one direction, nothing on the
 * other side) never wastes half a square canvas on empty space, and a
 * busy case never risks a node landing outside a pre-guessed size.
 */
/**
 * `Math.sin`/`Math.cos` are not guaranteed bit-identical across JS engines —
 * Node's V8 (server-side render) and a browser's V8 (client hydration) can
 * disagree in the last binary digit of a trig result for the exact same
 * input, which is invisible to the eye but not to React's hydration check:
 * it diffs the server-rendered attribute *string* against the client's
 * freshly computed number, and a difference as small as 1e-11px still
 * counts as a mismatch (confirmed live — this is exactly what produced a
 * real "hydrated but didn't match" warning on this graph). Rounding to 6
 * decimal places is many orders of magnitude finer than a screen pixel, so
 * nothing looks different — it just guarantees the server and client agree
 * on the exact string React renders/hydrates against.
 */
function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function computeLayout(nodes: MindMapNode[], edges: MindMapEdge[]): Map<string, Positioned> {
  const positions = new Map<string, Positioned>();

  const caseNode = nodes.find((n) => n.kind === "case");
  if (caseNode) positions.set(caseNode.id, { node: caseNode, x: 0, y: 0, angle: 0 });

  const exhibitNodes = nodes
    .filter((n) => n.kind === "exhibit")
    .slice()
    .sort((a, b) => (a.timestamp ?? "").localeCompare(b.timestamp ?? ""));

  exhibitNodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(exhibitNodes.length, 1) - Math.PI / 2;
    positions.set(n.id, { node: n, x: round6(RING1_RADIUS * Math.cos(angle)), y: round6(RING1_RADIUS * Math.sin(angle)), angle });
  });

  // First edge pointing at a node decides which exhibit (or the case, as a
  // fallback) it's grouped under for layout purposes — deterministic, and
  // good enough since the vast majority of nodes have exactly one parent.
  const parentOf = new Map<string, string>();
  for (const e of edges) {
    if (!parentOf.has(e.to)) parentOf.set(e.to, e.from);
  }

  const childrenByParent = new Map<string, MindMapNode[]>();
  for (const n of nodes) {
    if (n.kind === "case" || n.kind === "exhibit") continue;
    const parentId = parentOf.get(n.id) ?? caseNode?.id ?? "";
    if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
    childrenByParent.get(parentId)!.push(n);
  }

  for (const [parentId, children] of childrenByParent) {
    const parentPos = positions.get(parentId) ?? { node: caseNode!, x: 0, y: 0, angle: 0 };
    // Bias the fan away from the case center (outward-facing half of the
    // circle) so children don't double back over their own parent's link
    // to the case, but otherwise spread across the full available arc —
    // far roomier than a fixed narrow wedge once there are more than 3-4
    // children on one exhibit.
    const outward = parentPos.angle;
    const arc = Math.PI * 1.6;
    // A label under a node (e.g. a full domain name) is far wider than the
    // node itself — grows with sibling count so the arc-length between
    // adjacent children keeps pace with how many are crowded onto it,
    // instead of a fixed radius that only has enough room for 3-4. No
    // upper-bound risk of clipping here since the canvas is fit to the
    // result afterward rather than guessed beforehand.
    const clusterRadius = 90 + Math.min(children.length, 14) * 16;
    children.forEach((child, j) => {
      const t = children.length > 1 ? j / (children.length - 1) : 0.5;
      const angle = outward - arc / 2 + arc * t;
      positions.set(child.id, {
        node: child,
        x: round6(parentPos.x + clusterRadius * Math.cos(angle)),
        y: round6(parentPos.y + clusterRadius * Math.sin(angle)),
        angle,
      });
    });
  }

  return positions;
}

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Fits the canvas to whatever the layout actually produced, with a fixed
 * margin per node for its radius and label — the fix for a fixed square
 * canvas leaving half its area empty whenever the real content isn't
 * circularly symmetric (a single exhibit fanning its sources upward, say,
 * uses none of the space below the case node). */
function boundingBoxOf(positions: Map<string, Positioned>): ViewBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of positions.values()) {
    const r = nodeRadius(p.node);
    // Horizontal margin covers roughly half a typical label's width;
    // vertical margin covers the node radius plus the label's own height
    // below it.
    minX = Math.min(minX, p.x - Math.max(r, 70));
    maxX = Math.max(maxX, p.x + Math.max(r, 70));
    minY = Math.min(minY, p.y - r);
    maxY = Math.max(maxY, p.y + r + 26);
  }
  const pad = 24;
  return { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
}

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function NodeLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  const external = isExternalHref(href);
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} style={{ cursor: "pointer" }}>
      {children}
    </a>
  );
}

interface HoverCard {
  x: number;
  y: number;
  title: string;
  subtitle: string;
  detail: string;
  quote: string | null;
  href: string | null;
}

/**
 * Replaces the browser's own native SVG `<title>` tooltip — functional, but
 * a plain fixed-format OS tooltip that can't show a real multi-line gist
 * cleanly (no line-wrapping control, ~1s hover delay, no way to visually
 * separate "what this is" from "the actual gist"). This renders inside the
 * scrollable graph container using `position: fixed` keyed off the raw
 * mouse coordinates from the hover event, so it tracks correctly regardless
 * of how far the container has been scrolled/panned.
 */
function HoverTooltip({ card }: { card: HoverCard }) {
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-[280px] rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-xs shadow-lg"
      style={{ left: card.x + 14, top: card.y + 14 }}
    >
      <p className="font-medium text-text-primary">{card.title}</p>
      <p className="text-[10px] uppercase tracking-wide text-text-tertiary">{card.subtitle}</p>
      {card.detail && <p className="mt-1 text-text-secondary">{card.detail}</p>}
      {card.quote && <p className="mt-1 italic text-text-tertiary">&ldquo;{card.quote}&rdquo;</p>}
      {card.href && <p className="mt-1 truncate text-accent-primary">→ {card.href}</p>}
    </div>
  );
}

export function MindMapGraph({ nodes, edges }: { nodes: MindMapNode[]; edges: MindMapEdge[] }) {
  const [hover, setHover] = useState<HoverCard | null>(null);

  // Which kinds are toggled off via the legend — purely a render-time
  // filter, never fed back into computeLayout/boundingBoxOf, so hiding
  // "web source" nodes to declutter a busy case never reshuffles the
  // position of anything that's still visible.
  const [hiddenKinds, setHiddenKinds] = useState<Set<MindMapNodeKind>>(new Set());
  function toggleKind(kind: MindMapNodeKind) {
    setHiddenKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  // Hovering a node (or an edge) narrows focus to just that node's own
  // neighborhood — everything else fades to near-invisible — rather than
  // leaving every node/edge at full, equal visual weight all the time,
  // which is what actually makes a graph with more than a handful of nodes
  // read as "complicated": there's no way to tell, at a glance, what
  // connects to what without this. `null` means "nothing focused," i.e.
  // the original all-nodes-equal view.
  const [focusIds, setFocusIds] = useState<Set<string> | null>(null);
  function focusNode(id: string) {
    const connected = new Set<string>([id]);
    for (const e of edges) {
      if (e.from === id) connected.add(e.to);
      if (e.to === id) connected.add(e.from);
    }
    setFocusIds(connected);
  }
  function focusEdge(from: string, to: string) {
    setFocusIds(new Set([from, to]));
  }
  function clearFocus() {
    setFocusIds(null);
  }

  // Manual drag offsets, layered on top of the computed layout below rather
  // than replacing it — computeLayout still runs every render (it's cheap,
  // pure math over however many nodes exist) and gives every node its
  // algorithmic starting position; dragging one just overrides where it
  // actually renders. Edges read the exact same merged position map for
  // their endpoints, so a dragged node's lines follow it with zero special
  // casing — they were never hardcoded to the algorithmic position in the
  // first place, just whatever `positions.get(id)` returns.
  const [dragOverrides, setDragOverrides] = useState<Map<string, { x: number; y: number }>>(new Map());
  // A fresh mind-map run (new/removed nodes after re-running the AI layer)
  // makes any prior manual arrangement meaningless for nodes that may no
  // longer exist — reset rather than carry stale offsets forward. Compares
  // by array identity (the panel always passes a fresh array per fetch), so
  // this doesn't fire on every render, only when the actual graph changes.
  const [prevNodes, setPrevNodes] = useState(nodes);
  if (nodes !== prevNodes) {
    setPrevNodes(nodes);
    if (dragOverrides.size > 0) setDragOverrides(new Map());
  }

  // Tracks the in-progress drag across the pointerdown → pointermove →
  // pointerup sequence (a ref, not state — updating it must never itself
  // trigger a render) and, separately, whether that sequence actually moved
  // the node at all. The latter survives just long enough for the click
  // event that fires right after pointerup to check it: a node with a real
  // href (e.g. an exhibit) would otherwise navigate away the moment a drag
  // ends, since a drag-and-release is also, mechanically, a click.
  const dragIdRef = useRef<string | null>(null);
  const draggedRef = useRef(false);
  // A real drag moves the pointer several pixels between events — far
  // enough, at real mouse/trackpad speed, that it routinely leaves a small
  // 7px node before the browser has attached pointer capture to it. Element-
  // level `setPointerCapture` is supposed to keep routing events to that
  // element regardless, but this app's first cut relied on exactly that and
  // it did not hold up under a real trackpad drag (worked fine under
  // Puppeteer's synthetic, slow, step-by-step mouse moves — the discrepancy
  // is exactly this speed difference). Listening on `window` instead is the
  // standard, environment-independent fix: once a drag starts, every
  // pointermove/pointerup on the whole page is seen regardless of exactly
  // which element the cursor is physically over.
  const positionsRef = useRef<Map<string, Positioned>>(new Map());

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      const id = dragIdRef.current;
      if (!id) return;
      if (e.movementX !== 0 || e.movementY !== 0) draggedRef.current = true;
      setDragOverrides((prev) => {
        const current = prev.get(id) ?? positionsRef.current.get(id);
        if (!current) return prev;
        const next = new Map(prev);
        next.set(id, { x: current.x + e.movementX, y: current.y + e.movementY });
        return next;
      });
    }
    function handleUp() {
      dragIdRef.current = null;
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  // computeLayout/boundingBoxOf run unconditionally, even for the trivial
  // "nothing to graph" case below — they're cheap pure math over however
  // many nodes exist (zero or one, in that case) — so that positionsRef can
  // be synced via a plain effect without violating React's "hooks run in
  // the same order every render" rule, which an early `return` before this
  // point would otherwise do.
  const basePositions = computeLayout(nodes, edges);
  const positions = new Map(basePositions);
  for (const [id, offset] of dragOverrides) {
    const base = positions.get(id);
    if (base) positions.set(id, { ...base, x: offset.x, y: offset.y });
  }
  const box = boundingBoxOf(positions);
  const usedKinds = new Set(nodes.map((n) => n.kind));

  // Keeps the ref the window-level drag listener reads in sync with this
  // render's positions — an effect, not a direct assignment during render,
  // since mutating a ref's `.current` while rendering is itself a React
  // anti-pattern the lint rules (correctly) flag.
  useEffect(() => {
    positionsRef.current = positions;
  });

  if (nodes.length <= 1) {
    return (
      <p className="rounded-lg border border-dashed border-border-subtle p-4 text-xs text-text-tertiary">
        Nothing to graph yet — this case has no exhibits.
      </p>
    );
  }

  function startDrag(id: string) {
    return (e: React.PointerEvent<SVGGElement>) => {
      e.stopPropagation();
      e.preventDefault();
      dragIdRef.current = id;
      draggedRef.current = false;
    };
  }

  // Suppresses the click-triggered navigation (NodeLink wraps a real <a>
  // for nodes with an href) that would otherwise fire the instant a drag
  // ends — a pointerdown-move-up sequence is, to the DOM, also a click.
  function onNodeClickCapture(e: React.MouseEvent) {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Fixed width/height equal to the viewBox, NOT `w-full` — an SVG
          stretched to fill a wide container while its viewBox stays a
          fixed logical size scales up everything inside it, text included,
          by however much wider the container is than that viewBox. With
          few nodes that stretch was mild enough not to notice; with a
          dozen+ nodes it blew labels up 3-4x into unreadable, overlapping
          text. Rendering 1:1 and letting the wrapper scroll (both axes,
          same as the old horizontal-only behavior) keeps every label the
          size it was actually designed at, regardless of viewport width.
          The viewBox itself is fit to the real bounding box of the laid-
          out content (boundingBoxOf), not a pre-guessed square — a single
          exhibit fanning its sources in one direction no longer leaves
          half the canvas empty just because the box was sized to "look
          roughly circular" in advance. */}
      <div className="max-h-[640px] select-none overflow-auto rounded-lg border border-border-subtle bg-surface-sunken">
        <svg viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`} width={box.width} height={box.height}>
          <defs>
            <marker id="mm-arrow-structural" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0L10,5L0,10z" fill="var(--border-strong)" />
            </marker>
            <marker id="mm-arrow-ai" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0L10,5L0,10z" fill="var(--accent-primary)" />
            </marker>
          </defs>

          {edges.map((edge, i) => {
            const a = positions.get(edge.from);
            const b = positions.get(edge.to);
            if (!a || !b) return null;
            if (hiddenKinds.has(a.node.kind) || hiddenKinds.has(b.node.kind)) return null;
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const structural = edge.origin === "structural";
            const aNode = a.node;
            const bNode = b.node;
            const inFocus = !focusIds || (focusIds.has(edge.from) && focusIds.has(edge.to));
            return (
              <g
                key={`edge-${i}`}
                onMouseEnter={(e) => {
                  focusEdge(edge.from, edge.to);
                  setHover({
                    x: e.clientX,
                    y: e.clientY,
                    title: `${aNode.label} → ${bNode.label}`,
                    subtitle: structural ? "Real link" : "AI-inferred link",
                    detail: edge.label,
                    quote: edge.evidence,
                    href: null,
                  });
                }}
                onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                onMouseLeave={() => {
                  clearFocus();
                  setHover(null);
                }}
                style={{ transition: "opacity 150ms ease" }}
              >
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={structural ? "var(--border-strong)" : "var(--accent-primary)"}
                  strokeWidth={structural ? 1.25 : 1}
                  strokeDasharray={structural ? undefined : "3 3"}
                  opacity={inFocus ? (structural ? 1 : 0.75) : 0.06}
                  markerEnd={structural ? "url(#mm-arrow-structural)" : "url(#mm-arrow-ai)"}
                />
                {/* A wider, invisible line under the visible one — a 1-1.25px
                    stroke is a tiny, fiddly hover target; this makes the
                    hover card actually easy to trigger without changing how
                    the edge looks. */}
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={10} />
                {/* Only draw the label text for edges that say something
                    distinct per-edge (an AI relationship/mention, or the
                    single case→exhibit "contains" edge). A structural
                    match/web-source/reference edge repeats the same handful
                    of labels once per sibling — with several such edges
                    fanning off one exhibit that becomes a wall of
                    overlapping duplicate text, when the node's own kind,
                    color, and tooltip already say the same thing. */}
                {(!structural || edge.label === "contains") && (
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    opacity={inFocus ? 1 : 0.06}
                    className="fill-[var(--text-secondary)] text-[9px] font-semibold"
                    style={{ paintOrder: "stroke", stroke: "var(--surface-sunken)", strokeWidth: 4 }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map((node) => {
            if (hiddenKinds.has(node.kind)) return null;
            const p = positions.get(node.id);
            if (!p) return null;
            const r = nodeRadius(node);
            const color = nodeColor(node);
            const inFocus = !focusIds || focusIds.has(node.id);
            return (
              <NodeLink key={node.id} href={node.href}>
                <g
                  onMouseEnter={(e) => {
                    focusNode(node.id);
                    setHover({
                      x: e.clientX,
                      y: e.clientY,
                      title: node.label,
                      subtitle: `${KIND_LABEL[node.kind]} · ${node.origin === "structural" ? "real fact" : "AI-inferred"}`,
                      detail: node.detail,
                      quote: null,
                      href: node.href,
                    });
                  }}
                  onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                  onMouseLeave={() => {
                    clearFocus();
                    setHover(null);
                  }}
                  onPointerDown={startDrag(node.id)}
                  onClick={onNodeClickCapture}
                  onDragStart={(e) => e.preventDefault()}
                  style={{ cursor: "grab", touchAction: "none", opacity: inFocus ? 1 : 0.15, transition: "opacity 150ms ease" }}
                >
                  {/* Invisible, larger hit target — a 7px-radius node (the
                      default for anything that isn't the case/exhibit) is a
                      genuinely fiddly thing to grab precisely; this widens
                      what counts as "on the node" for both hover and drag
                      without changing how the node actually looks. */}
                  <circle cx={p.x} cy={p.y} r={r + 8} fill="transparent" />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r}
                    fill={node.kind === "case" ? color : "var(--surface-raised)"}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray={node.origin === "ai_inferred" ? "2 2" : undefined}
                  />
                  <text
                    x={p.x}
                    y={p.y + r + 13}
                    textAnchor="middle"
                    className="fill-[var(--text-primary)] text-[10.5px] font-semibold"
                    style={{ paintOrder: "stroke", stroke: "var(--surface-sunken)", strokeWidth: 4 }}
                  >
                    {node.label}
                  </text>
                </g>
              </NodeLink>
            );
          })}
        </svg>
      </div>
      {hover && <HoverTooltip card={hover} />}

      <p className="text-[10px] text-text-tertiary">
        Hover any dot to trace its connections, drag to rearrange, click a legend item below to hide that kind.
      </p>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[10px] text-text-tertiary">
        {(Object.keys(KIND_LABEL) as MindMapNodeKind[])
          .filter((k) => usedKinds.has(k))
          .map((k) => {
            const isHidden = hiddenKinds.has(k);
            const toggleable = k !== "case";
            return (
              <button
                key={k}
                type="button"
                disabled={!toggleable}
                onClick={() => toggleKind(k)}
                aria-pressed={isHidden}
                title={toggleable ? (isHidden ? `Show ${KIND_LABEL[k]} nodes` : `Hide ${KIND_LABEL[k]} nodes`) : undefined}
                className={cn(
                  "flex items-center gap-1 rounded-full border border-transparent px-1.5 py-0.5",
                  toggleable && "cursor-pointer hover:border-border-subtle hover:bg-surface-raised",
                  isHidden && "opacity-40 line-through",
                )}
              >
                <span
                  className="inline-block size-2.5 shrink-0 rounded-full border-2"
                  style={{ borderColor: k === "exhibit" ? "var(--status-neutral)" : KIND_COLOR[k as Exclude<MindMapNodeKind, "exhibit">] }}
                />
                {KIND_LABEL[k]}
              </button>
            );
          })}
        <span className="flex items-center gap-1">
          <span className="inline-block h-px w-4 bg-[var(--border-strong)]" /> real / database fact
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-px w-4 border-t border-dashed border-[var(--accent-primary)]" /> AI-inferred (unverified lead)
        </span>
      </div>
    </div>
  );
}

/**
 * Chronological read of every node that carries a real timestamp — uploads,
 * corpus first-seen dates, web-search hits — the concrete answer to "how
 * did this spread and when," which the previous flat entity list had no
 * way to show at all.
 */
export function MindMapTimeline({ nodes }: { nodes: MindMapNode[] }) {
  const timed = nodes
    .filter((n): n is MindMapNode & { timestamp: string } => n.timestamp !== null)
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (timed.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface p-3">
      <p className="text-xs font-medium text-text-secondary">Timeline</p>
      <ol className="flex flex-col gap-1.5">
        {timed.map((n) => (
          <li key={n.id} className="flex items-start gap-2 text-[11px]">
            <span className="mt-0.5 inline-block size-2 shrink-0 rounded-full border-2" style={{ borderColor: nodeColor(n) }} />
            <span className="text-text-tertiary tabular-nums">{formatTimestamp(new Date(n.timestamp))}</span>
            <NodeLink href={n.href}>
              <span className="text-text-secondary underline-offset-2 hover:underline">{n.label}</span>
            </NodeLink>
            {n.detail && <span className="text-text-tertiary">— {n.detail}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
