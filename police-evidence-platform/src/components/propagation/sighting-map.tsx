import { Globe2, MapPinOff } from "lucide-react";
import type { EvidencePropagation, PropagationSighting } from "@/lib/propagation-server";
import { projectLatLon, WorldMapSvg } from "@/components/shared/world-map";

const KIND_COLOR: Record<PropagationSighting["kind"], string> = {
  origin: "var(--accent-primary)",
  "cross-case": "var(--status-warning)",
  corpus: "var(--status-safe)",
};
const KIND_LABEL: Record<PropagationSighting["kind"], string> = {
  origin: "Uploaded here",
  "cross-case": "Matches another case",
  corpus: "Matches seeded corpus",
};

/** Smooth curve through ordered points — Q control point is the point
 * itself, anchor is the midpoint to the next one, a small well-known trick
 * for a soft line through a sequence without a spline library dependency. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x},${curr.y} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x},${last.y}`;
  return d;
}

/**
 * Plain lat/long graticule scatter plot on the shared WorldMapSvg backdrop
 * (see components/shared/world-map.tsx) — deliberately no bundled world-
 * outline asset or tile server, consistent with the app's offline-first
 * design. Only plots sightings with a real resolved `location` (EXIF GPS
 * or IP geolocation, see propagation-server.ts) — most sightings won't
 * have one, and those are simply absent from the map, not guessed. Each
 * marker is an anchor to its row in the list below (`#sighting-<id>`), so
 * clicking jumps to the detail without needing client-side JS — every bit
 * of polish here (glow, pulsing origin ring, numbered order) is pure
 * declarative SVG for the same reason, no "use client".
 */
export function SightingMap({ evidence }: { evidence: EvidencePropagation[] }) {
  const allSightings = evidence.flatMap((ev) => ev.sightings);
  const located = allSightings
    .filter((s): s is PropagationSighting & { location: NonNullable<PropagationSighting["location"]> } =>
      Boolean(s.location),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (located.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle bg-surface-sunken/40 px-4 py-8 text-center">
        <MapPinOff className="size-6 text-text-tertiary" />
        <p className="max-w-md text-xs text-text-tertiary">
          No sighting has a resolvable location yet — needs either embedded EXIF GPS (rare; usually stripped by
          messaging apps/re-saves) or an IP address captured on upload that resolves to a public geolocation
          (usually unavailable when running with no reverse proxy in front, e.g. locally).
        </p>
      </div>
    );
  }

  const points = located.map((s) => projectLatLon(s.location.lat, s.location.lon));
  const presentKinds = [...new Set(located.map((s) => s.kind))];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Globe2 className="size-3.5 text-accent-primary" />
          {located.length} of {allSightings.length} sighting{allSightings.length === 1 ? "" : "s"} located, in order
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-tertiary">
          {presentKinds.map((k) => (
            <span key={k} className="flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: KIND_COLOR[k] }} />
              {KIND_LABEL[k]}
            </span>
          ))}
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full border border-current" />
            EXIF GPS
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full border border-dashed border-current" />
            IP geolocation (approx.)
          </span>
        </div>
      </div>

      <WorldMapSvg idPrefix="sighting-map">
        <defs>
          <linearGradient id="sighting-map-path" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--border-strong)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.9" />
          </linearGradient>
          <marker id="sighting-map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-primary)" />
          </marker>
        </defs>

        {points.length > 1 && (
          <path
            d={smoothPath(points)}
            fill="none"
            stroke="url(#sighting-map-path)"
            strokeWidth={1.5}
            strokeLinecap="round"
            markerEnd="url(#sighting-map-arrow)"
          />
        )}

        {located.map((s, i) => {
          const p = points[i];
          const isOrigin = i === 0;
          const isExif = s.location.source === "exif";
          return (
            <a key={s.id} href={`#sighting-${s.id}`} className="cursor-pointer transition-opacity hover:opacity-80">
              {isOrigin && (
                <circle cx={p.x} cy={p.y} r={9} fill="none" stroke={KIND_COLOR[s.kind]} strokeWidth={1.5} opacity={0.7}>
                  <animate attributeName="r" values="9;18;9" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.55;0;0.55" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isOrigin ? 10 : 9}
                fill={KIND_COLOR[s.kind]}
                stroke="var(--surface)"
                strokeWidth={2}
                filter="url(#sighting-map-glow)"
              />
              {!isExif && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={(isOrigin ? 10 : 9) + 4}
                  fill="none"
                  stroke={KIND_COLOR[s.kind]}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  opacity={0.7}
                />
              )}
              <text x={p.x} y={p.y} fill="var(--surface)" fontSize={9} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="select-none">
                {i + 1}
              </text>
              <title>{`${i + 1}. ${s.label} — ${s.location.label} (${isExif ? "EXIF GPS" : "IP geolocation, approx."})`}</title>
            </a>
          );
        })}
      </WorldMapSvg>
    </div>
  );
}
