"use client";

import { useRef, useState } from "react";
import {
  arcPath,
  buildGraticule,
  GLOBE_CENTER,
  GLOBE_R,
  GLOBE_SIZE,
  projectCountryOutlines,
  projectOrthographic,
  type GlobeMarker,
} from "@/lib/globe-projection";
import { MarkerPreview } from "@/components/shared/marker-preview";

export type { GlobeMarker } from "@/lib/globe-projection";

const DEG_PER_PIXEL = 0.4;
const MAX_ABS_LAT = 85;

/**
 * A real orthographic-projection 3D-look globe (not a flat rectangle) —
 * glossy sphere shading, a real graticule curved to match, per-exhibit
 * colored "flight path" arcs from each origin to its own results, and a
 * dashed timeline path connecting every origin in upload order. Pure
 * declarative SVG/CSS (gradient + drop-shadow filter + SVG <animate>), no
 * WebGL/three.js/tile-server dependency — consistent with the app's
 * offline-first, no-new-heavy-dependency approach used everywhere else.
 * Draggable: pointer-drag rotates the sphere (own internal rotation state,
 * starting from `initialCenterLat`/`initialCenterLon`) so a marker that
 * starts out on the far side is actually reachable, not just disclosed as
 * hidden — a flat map has no such "other side" problem, but a globe does,
 * and a globe you can't turn is worse than the flat map it replaced.
 * "use client" (state + pointer handlers) — the pure projection math it's
 * built on lives in lib/globe-projection.ts so a Server Component can
 * still compute marker positions/decluster/centroid without this file's
 * client boundary getting in the way.
 */
export function GlobeMapSvg({
  idPrefix,
  initialCenterLat,
  initialCenterLon,
  markers,
}: {
  idPrefix: string;
  initialCenterLat: number;
  initialCenterLon: number;
  markers: GlobeMarker[];
}) {
  const [rotation, setRotation] = useState({ lat: initialCenterLat, lon: initialCenterLon });
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
    setHoveredKey(null);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragOrigin.current) return;
    const dx = e.clientX - dragOrigin.current.x;
    const dy = e.clientY - dragOrigin.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragged.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    setRotation((r) => ({
      lat: Math.max(-MAX_ABS_LAT, Math.min(MAX_ABS_LAT, r.lat + dy * DEG_PER_PIXEL)),
      lon: r.lon - dx * DEG_PER_PIXEL,
    }));
  }
  function handlePointerUp() {
    dragOrigin.current = null;
  }
  // Swallows the click that follows a drag so releasing the mouse over a
  // marker doesn't also navigate to it — a real click (no movement) still
  // reaches the marker's own <a>, since this only fires on the wrapping
  // <svg>, before the drag flag resets for the next gesture.
  function handleClickCapture(e: React.MouseEvent<SVGSVGElement>) {
    if (dragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const { lat: centerLat, lon: centerLon } = rotation;
  const graticule = buildGraticule(centerLat, centerLon);
  const countries = projectCountryOutlines(centerLat, centerLon);
  const groups = new Map<string, GlobeMarker[]>();
  for (const m of markers) {
    const group = groups.get(m.groupId);
    if (group) group.push(m);
    else groups.set(m.groupId, [m]);
  }
  const origins = markers
    .filter((m): m is GlobeMarker & { order: number } => m.variant === "origin" && m.order != null)
    .sort((a, b) => a.order - b.order);
  const hiddenCount = markers.filter((m) => !projectOrthographic(m.lat, m.lon, centerLat, centerLon).visible).length;

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-sunken py-4">
      <svg
        viewBox={`0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`}
        className="h-[320px] w-[320px] shrink-0 touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        <defs>
          <radialGradient id={`${idPrefix}-sphere`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--accent-dim)" stopOpacity="0.9" />
            <stop offset="55%" stopColor="var(--surface-sunken)" stopOpacity="1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
          <filter id={`${idPrefix}-globe-shadow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.5" />
          </filter>
          <filter id={`${idPrefix}-marker-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="var(--surface)" floodOpacity="0.9" />
          </filter>
          <marker id={`${idPrefix}-timeline-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-tertiary)" />
          </marker>
        </defs>

        <circle
          cx={GLOBE_CENTER}
          cy={GLOBE_CENTER}
          r={GLOBE_R}
          fill={`url(#${idPrefix}-sphere)`}
          stroke="var(--border-strong)"
          strokeWidth={1}
          filter={`url(#${idPrefix}-globe-shadow)`}
        />

        <g clipPath={`url(#${idPrefix}-sphere-clip)`}>
          <clipPath id={`${idPrefix}-sphere-clip`}>
            <circle cx={GLOBE_CENTER} cy={GLOBE_CENTER} r={GLOBE_R} />
          </clipPath>
          {countries.fillPaths.map((d, i) => (
            <path key={`land-${i}`} d={d} fill="var(--status-safe)" fillOpacity={0.28} stroke="var(--status-safe)" strokeOpacity={0.6} strokeWidth={0.5} />
          ))}
          {countries.strokeRuns.map((run, i) => (
            <polyline key={`coast-${i}`} points={run.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--status-safe)" strokeOpacity={0.5} strokeWidth={0.5} />
          ))}
          {graticule.map((run, i) =>
            run.length > 1 ? (
              <polyline
                key={i}
                points={run.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth={0.5}
                opacity={0.5}
              />
            ) : null,
          )}
        </g>

        {/* Per-exhibit arcs: origin -> its own results only. */}
        {[...groups.values()].flatMap((group) => {
          const origin = group.find((m) => m.variant === "origin");
          if (!origin) return [];
          const originPoint = projectOrthographic(origin.lat, origin.lon, centerLat, centerLon);
          if (!originPoint.visible) return [];
          return group
            .filter((m) => m.variant === "result")
            .map((m) => {
              const p = projectOrthographic(m.lat, m.lon, centerLat, centerLon);
              if (!p.visible) return null;
              return (
                <path key={`arc-${m.key}`} d={arcPath(originPoint, p)} fill="none" stroke={m.color} strokeWidth={0.75} strokeOpacity={0.55} />
              );
            });
        })}

        {/* Dashed timeline connecting every exhibit's origin in upload
            order — "where it started, in what sequence." Neutral color so
            it reads as structure, not as one more exhibit's own color. */}
        {origins.length > 1 &&
          origins.slice(1).map((m, i) => {
            const prev = origins[i];
            const p1 = projectOrthographic(prev.lat, prev.lon, centerLat, centerLon);
            const p2 = projectOrthographic(m.lat, m.lon, centerLat, centerLon);
            if (!p1.visible || !p2.visible) return null;
            return (
              <path
                key={`timeline-${m.key}`}
                d={arcPath(p1, p2)}
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth={1}
                strokeDasharray="3 3"
                markerEnd={`url(#${idPrefix}-timeline-arrow)`}
              />
            );
          })}

        {markers.map((m) => {
          const p = projectOrthographic(m.lat, m.lon, centerLat, centerLon);
          if (!p.visible) return null;
          const isOrigin = m.variant === "origin";
          const content = (
            <>
              {isOrigin && (
                <circle cx={p.x} cy={p.y} r={8} fill="none" stroke={m.color} strokeWidth={1.5} opacity={0.7}>
                  <animate attributeName="r" values="8;17;8" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.55;0;0.55" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isOrigin ? 7 : 5}
                fill={isOrigin ? m.color : "none"}
                stroke={isOrigin ? "var(--surface)" : m.color}
                strokeWidth={isOrigin ? 1.25 : 1.75}
                strokeDasharray={isOrigin ? undefined : "2 1.5"}
                filter={`url(#${idPrefix}-marker-glow)`}
              />
              {isOrigin && m.order != null && (
                <text x={p.x} y={p.y} fill="var(--surface)" fontSize={8} fontWeight={700} textAnchor="middle" dominantBaseline="central" className="pointer-events-none select-none">
                  {m.order}
                </text>
              )}
              {/* Invisible, larger hit target — the base marker (down to a
                  5px "result" dot) is a fiddly thing to hover precisely;
                  this widens the real hover area without changing how the
                  marker actually looks. Hover itself is handled by the
                  wrapping <a>/<g> below (hoverHandlers), so this needs no
                  handlers of its own — it just enlarges what that wrapper
                  catches. */}
              <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
            </>
          );
          const hoverHandlers = { onMouseEnter: () => setHoveredKey(m.key), onMouseLeave: () => setHoveredKey(null) };
          return m.href ? (
            <a
              key={m.key}
              href={m.href}
              target="_blank"
              rel="noreferrer noopener"
              className="cursor-pointer transition-opacity hover:opacity-80"
              {...hoverHandlers}
            >
              {content}
            </a>
          ) : (
            <g key={m.key} {...hoverHandlers}>
              {content}
            </g>
          );
        })}

        {(() => {
          const hovered = markers.find((m) => m.key === hoveredKey);
          if (!hovered?.preview) return null;
          const p = projectOrthographic(hovered.lat, hovered.lon, centerLat, centerLon);
          if (!p.visible) return null;
          return <MarkerPreview preview={hovered.preview} x={p.x} y={p.y} boundsWidth={GLOBE_SIZE} boundsHeight={GLOBE_SIZE} />;
        })()}
      </svg>
      <p className="text-[10px] text-text-tertiary">
        Drag to rotate
        {hiddenCount > 0 && ` — ${hiddenCount} marker${hiddenCount === 1 ? " is" : "s are"} currently on the far side`}
      </p>
    </div>
  );
}
