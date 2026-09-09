import { WORLD_COUNTRIES } from "@/lib/world-countries-data";

export const WORLD_MAP_WIDTH = 720;
export const WORLD_MAP_HEIGHT = 360;

export function projectLatLon(lat: number, lon: number): { x: number; y: number } {
  return { x: ((lon + 180) / 360) * WORLD_MAP_WIDTH, y: ((90 - lat) / 180) * WORLD_MAP_HEIGHT };
}

const GRID_LONS = [-120, -60, 60, 120];
const GRID_LATS = [-60, -30, 30, 60];

// Precomputed once at module load, not per-render — unlike the 3D globe
// (globe-projection.ts), a flat equirectangular projection never depends
// on any rotation/viewing angle, so there's nothing to recompute. A
// handful of countries that straddle the antimeridian (Russia, Fiji, the
// Aleutians) draw a stray seam line across the map at ±180° — a known,
// accepted quirk of naive equirectangular rendering, not worth a real
// polygon-splitting implementation for a decorative bundled map.
const FLAT_COUNTRY_FILL_PATHS: string[] = WORLD_COUNTRIES.flatMap((country) =>
  country.rings.map((ring) => `M ${ring.map(([lon, lat]) => { const p = projectLatLon(lat, lon); return `${p.x},${p.y}`; }).join(" L ")} Z`),
);

/**
 * Shared ocean-gradient graticule backdrop (defs + grid + meridian/equator
 * lines+labels) for every lat/lon scatter map in the app — kept in one
 * place so the case's Geographic trace map (propagation/sighting-map.tsx)
 * and the per-exhibit web-search results map (web-search-panel.tsx) read
 * as the same map, not two ad hoc implementations. Still deliberately no
 * bundled world-outline asset or tile server (offline-first, see
 * sighting-map.tsx's own comment) — just real polish over plain lat/lon
 * projection math. No hooks/state, safe to use from a Server Component or
 * a "use client" one. `idPrefix` keeps SVG `<defs>` ids unique when more
 * than one of these renders on the same page (gradient/filter ids must be
 * unique per-document, not just per-component).
 */
export function WorldMapSvg({
  idPrefix,
  heightClassName = "h-[320px]",
  children,
}: {
  idPrefix: string;
  heightClassName?: string;
  children: React.ReactNode;
}) {
  const origin = projectLatLon(0, 0);
  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <svg viewBox={`0 0 ${WORLD_MAP_WIDTH} ${WORLD_MAP_HEIGHT}`} className={`${heightClassName} w-full min-w-[420px]`}>
        <defs>
          <radialGradient id={`${idPrefix}-ocean`} cx="50%" cy="42%" r="75%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="1" />
          </radialGradient>
          <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="var(--surface)" floodOpacity="0.9" />
          </filter>
        </defs>

        <rect x={0} y={0} width={WORLD_MAP_WIDTH} height={WORLD_MAP_HEIGHT} fill={`url(#${idPrefix}-ocean)`} />

        {FLAT_COUNTRY_FILL_PATHS.map((d, i) => (
          <path key={`land-${i}`} d={d} fill="#22c55e" fillOpacity={0.85} stroke="#15803d" strokeOpacity={0.9} strokeWidth={0.5} />
        ))}

        {GRID_LONS.map((lon) => {
          const { x } = projectLatLon(0, lon);
          return (
            <line key={`lon-${lon}`} x1={x} y1={0} x2={x} y2={WORLD_MAP_HEIGHT} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={0.5} strokeDasharray="2 4" />
          );
        })}
        {GRID_LATS.map((lat) => {
          const { y } = projectLatLon(lat, 0);
          return (
            <line key={`lat-${lat}`} x1={0} y1={y} x2={WORLD_MAP_WIDTH} y2={y} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={0.5} strokeDasharray="2 4" />
          );
        })}
        <line x1={origin.x} y1={0} x2={origin.x} y2={WORLD_MAP_HEIGHT} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={0.75} />
        <line x1={0} y1={origin.y} x2={WORLD_MAP_WIDTH} y2={origin.y} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={0.75} />
        <text x={origin.x + 4} y={10} fill="#ffffff" fillOpacity={0.85} fontSize={9} className="font-mono">
          Prime Meridian
        </text>
        <text x={WORLD_MAP_WIDTH - 4} y={origin.y - 4} fill="#ffffff" fillOpacity={0.85} fontSize={9} textAnchor="end" className="font-mono">
          Equator
        </text>

        {children}
      </svg>
    </div>
  );
}
