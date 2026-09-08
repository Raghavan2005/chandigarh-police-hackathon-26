import type { MindMapNode, MindMapEdge, MindMapNodeKind } from "@/lib/mindmap-server";
import { formatTimestamp } from "@/lib/utils";

const KIND_COLOR: Record<Exclude<MindMapNodeKind, "exhibit">, string> = {
  case: "var(--text-primary)",
  match: "var(--status-warning)",
  web_source: "var(--status-inconclusive)",
  person: "var(--accent-primary)",
  organization: "var(--status-warning)",
  location: "var(--status-safe)",
  other: "var(--text-tertiary)",
};

const KIND_LABEL: Record<MindMapNodeKind, string> = {
  case: "Case",
  exhibit: "Exhibit (colored by verdict)",
  match: "Internal match (corpus/cross-case/reference)",
  web_source: "External web source",
  person: "Person (AI-inferred)",
  organization: "Organization (AI-inferred)",
  location: "Location (AI-inferred)",
  other: "Other entity (AI-inferred)",
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
    positions.set(n.id, { node: n, x: RING1_RADIUS * Math.cos(angle), y: RING1_RADIUS * Math.sin(angle), angle });
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
        x: parentPos.x + clusterRadius * Math.cos(angle),
        y: parentPos.y + clusterRadius * Math.sin(angle),
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

export function MindMapGraph({ nodes, edges }: { nodes: MindMapNode[]; edges: MindMapEdge[] }) {
  if (nodes.length <= 1) {
    return (
      <p className="rounded-lg border border-dashed border-border-subtle p-4 text-xs text-text-tertiary">
        Nothing to graph yet — this case has no exhibits.
      </p>
    );
  }

  const positions = computeLayout(nodes, edges);
  const box = boundingBoxOf(positions);
  const usedKinds = new Set(nodes.map((n) => n.kind));

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
      <div className="max-h-[640px] overflow-auto rounded-lg border border-border-subtle bg-surface-sunken">
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
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const structural = edge.origin === "structural";
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={structural ? "var(--border-strong)" : "var(--accent-primary)"}
                  strokeWidth={structural ? 1.25 : 1}
                  strokeDasharray={structural ? undefined : "3 3"}
                  opacity={structural ? 1 : 0.75}
                  markerEnd={structural ? "url(#mm-arrow-structural)" : "url(#mm-arrow-ai)"}
                />
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
                    className="fill-[var(--text-secondary)] text-[8.5px] font-medium"
                    style={{ paintOrder: "stroke", stroke: "var(--surface-sunken)", strokeWidth: 4 }}
                  >
                    {edge.label}
                  </text>
                )}
                <title>{`${edge.from} → ${edge.to}: ${edge.label}${edge.evidence ? `\n"${edge.evidence}"` : ""}`}</title>
              </g>
            );
          })}

          {nodes.map((node) => {
            const p = positions.get(node.id);
            if (!p) return null;
            const r = nodeRadius(node);
            const color = nodeColor(node);
            return (
              <NodeLink key={node.id} href={node.href}>
                <g>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r}
                    fill={node.kind === "case" ? color : "var(--surface-raised)"}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray={node.origin === "ai_inferred" ? "2 2" : undefined}
                  />
                  <text x={p.x} y={p.y + r + 12} textAnchor="middle" className="fill-[var(--text-primary)] text-[9px] font-medium">
                    {node.label}
                  </text>
                  <title>{`${node.label} (${KIND_LABEL[node.kind]})\n${node.detail}${node.href ? `\n→ ${node.href}` : ""}`}</title>
                </g>
              </NodeLink>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-text-tertiary">
        {(Object.keys(KIND_LABEL) as MindMapNodeKind[])
          .filter((k) => usedKinds.has(k))
          .map((k) => (
            <span key={k} className="flex items-center gap-1">
              <span
                className="inline-block size-2.5 rounded-full border-2"
                style={{ borderColor: k === "exhibit" ? "var(--status-neutral)" : KIND_COLOR[k as Exclude<MindMapNodeKind, "exhibit">] }}
              />
              {KIND_LABEL[k]}
            </span>
          ))}
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
