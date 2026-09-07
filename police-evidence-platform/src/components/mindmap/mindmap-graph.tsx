import type { MindMapEntity, MindMapRelationship } from "@/lib/mindmap-server";

const TYPE_COLOR: Record<MindMapEntity["type"], string> = {
  person: "var(--accent-primary)",
  organization: "var(--status-warning)",
  location: "var(--status-safe)",
  other: "var(--text-tertiary)",
};

const NODE_R = 9;

/**
 * Real node-link graph of this case's Gemini-extracted entities and
 * text-evidenced relationships — same "plain typed props in, hand-rolled
 * <svg> out, no charting library" shape as
 * propagation/sighting-map.tsx / sighting-tree-graph.tsx, adapted for
 * entities-as-nodes/relationships-as-edges instead of geographic points or
 * a fixed origin-rooted tree. Nodes are placed evenly around a circle
 * (deliberately simple — no force-directed layout dependency), edges drawn
 * straight between them with their real relationship label at the
 * midpoint and the grounding text/quote on hover.
 */
export function MindMapGraph({
  entities,
  relationships,
}: {
  entities: MindMapEntity[];
  relationships: MindMapRelationship[];
}) {
  if (entities.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-subtle p-4 text-xs text-text-tertiary">
        No named entities were identified in this case&apos;s analyzed text.
      </p>
    );
  }

  // Every relationship endpoint gets a node even if the model didn't also
  // list it in `entities` — keeps a plausible-but-slightly-inconsistent
  // model response from silently dropping edges rather than fabricating
  // anything: the node itself carries no invented detail beyond its name.
  const byName = new Map(entities.map((e) => [e.name, e]));
  const allEntities: MindMapEntity[] = [...entities];
  for (const rel of relationships) {
    for (const name of [rel.from, rel.to]) {
      if (!byName.has(name)) {
        const placeholder: MindMapEntity = { name, type: "other", note: "Referenced only in a relationship, not separately identified." };
        byName.set(name, placeholder);
        allEntities.push(placeholder);
      }
    }
  }

  const size = Math.max(380, allEntities.length * 68);
  const center = size / 2;
  const radius = size / 2 - 90;
  const positions = new Map<string, { x: number; y: number }>();
  allEntities.forEach((entity, i) => {
    const angle = (2 * Math.PI * i) / allEntities.length - Math.PI / 2;
    positions.set(entity.name, { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) });
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-sunken">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full min-w-[480px]" style={{ height: Math.min(size, 560) }}>
        {relationships.map((rel, i) => {
          const a = positions.get(rel.from);
          const b = positions.get(rel.to);
          if (!a || !b) return null;
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          return (
            <g key={`edge-${i}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border-strong)" strokeWidth={1.25} />
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                className="fill-[var(--text-secondary)] text-[9px] font-medium"
                style={{ paintOrder: "stroke", stroke: "var(--surface-sunken)", strokeWidth: 4 }}
              >
                {rel.label}
              </text>
              <title>{`${rel.from} → ${rel.to}: ${rel.label}\n"${rel.evidence}"`}</title>
            </g>
          );
        })}

        {allEntities.map((entity) => {
          const p = positions.get(entity.name);
          if (!p) return null;
          return (
            <g key={entity.name}>
              <circle cx={p.x} cy={p.y} r={NODE_R} fill="var(--surface-raised)" stroke={TYPE_COLOR[entity.type]} strokeWidth={2} />
              <text x={p.x} y={p.y + NODE_R + 13} textAnchor="middle" className="fill-[var(--text-primary)] text-[10px] font-medium">
                {entity.name}
              </text>
              <title>{`${entity.name} (${entity.type})\n${entity.note}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
