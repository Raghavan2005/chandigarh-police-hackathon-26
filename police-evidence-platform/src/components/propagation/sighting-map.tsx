import type { EvidencePropagation, PropagationSighting } from "@/lib/propagation-server";

const KIND_COLOR: Record<PropagationSighting["kind"], string> = {
  origin: "var(--accent-primary)",
  "cross-case": "var(--status-warning)",
  corpus: "var(--status-safe)",
};

const WIDTH = 720;
const HEIGHT = 360;

function project(lat: number, lon: number): { x: number; y: number } {
  return { x: ((lon + 180) / 360) * WIDTH, y: ((90 - lat) / 180) * HEIGHT };
}

/**
 * Plain lat/long graticule scatter plot — deliberately no bundled world-
 * outline asset or tile server, consistent with the app's offline-first
 * design and its existing hand-rolled SVG visualizations (the old mock
 * PropagationGraph). Only plots sightings with a real resolved `location`
 * (EXIF GPS or IP geolocation, see propagation-server.ts) — most sightings
 * won't have one, and those are simply absent from the map, not guessed.
 * Each marker is an anchor to its row in the list below (`#sighting-<id>`),
 * so clicking jumps to the detail without needing client-side JS.
 */
export function SightingMap({ evidence }: { evidence: EvidencePropagation[] }) {
  const located = evidence
    .flatMap((ev) => ev.sightings)
    .filter((s): s is PropagationSighting & { location: NonNullable<PropagationSighting["location"]> } =>
      Boolean(s.location),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (located.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border-subtle p-4 text-xs text-text-tertiary">
        No sighting has a resolvable location yet — needs either embedded EXIF GPS (rare; usually stripped by
        messaging apps/re-saves) or an IP address captured on upload that resolves to a public geolocation (usually
        unavailable when running with no reverse proxy in front, e.g. locally).
      </p>
    );
  }

  const gridLons = [-180, -120, -60, 0, 60, 120, 180];
  const gridLats = [-90, -60, -30, 0, 30, 60, 90];

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-sunken">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[300px] w-full min-w-[560px]">
        {gridLons.map((lon) => {
          const { x } = project(0, lon);
          return (
            <line
              key={`lon-${lon}`}
              x1={x}
              y1={0}
              x2={x}
              y2={HEIGHT}
              stroke="var(--border-subtle)"
              strokeWidth={lon === 0 ? 1 : 0.5}
            />
          );
        })}
        {gridLats.map((lat) => {
          const { y } = project(lat, 0);
          return (
            <line
              key={`lat-${lat}`}
              x1={0}
              y1={y}
              x2={WIDTH}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth={lat === 0 ? 1 : 0.5}
            />
          );
        })}

        <polyline
          points={located.map((s) => { const p = project(s.location.lat, s.location.lon); return `${p.x},${p.y}`; }).join(" ")}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {located.map((s, i) => {
          const p = project(s.location.lat, s.location.lon);
          return (
            <a key={s.id} href={`#sighting-${s.id}`}>
              <circle cx={p.x} cy={p.y} r={i === 0 ? 6 : 5} fill={KIND_COLOR[s.kind]} stroke="var(--surface)" strokeWidth={1.5} />
              <title>{`${s.label} — ${s.location.label} (${s.location.source === "exif" ? "EXIF GPS" : "IP geolocation, approx."})`}</title>
            </a>
          );
        })}
      </svg>
    </div>
  );
}
