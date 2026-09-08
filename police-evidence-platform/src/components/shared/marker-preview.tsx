import type { GlobeMarkerPreview } from "@/lib/globe-projection";

const CARD_WIDTH = 190;
const CARD_HEIGHT = 92;
const MARGIN = 4;

/**
 * A small hover-preview card rendered as an SVG <foreignObject> anchored
 * near a marker — used by both the 2D flat map and the 3D globe so hovering
 * a pin shows real detail (headline/domain/date/location) instead of
 * relying on the native OS title-attribute tooltip alone (still present as
 * a fallback). foreignObject content inherits the parent <svg>'s own
 * viewBox-to-viewport scaling, so this positions/sizes itself in the same
 * coordinate units as the markers themselves (x/y/boundsWidth/boundsHeight
 * are all in that SVG's user-unit space, not CSS pixels) — correct whether
 * the SVG renders at a fixed 320x320 (the globe) or scales responsively
 * (the flat map's `w-full`), with no separate resize/measurement logic
 * needed. `pointer-events-none` keeps it from stealing the hover it's
 * reacting to.
 */
export function MarkerPreview({
  preview,
  x,
  y,
  boundsWidth,
  boundsHeight,
}: {
  preview: GlobeMarkerPreview;
  x: number;
  y: number;
  boundsWidth: number;
  boundsHeight: number;
}) {
  const fx = Math.min(Math.max(x - CARD_WIDTH / 2, MARGIN), boundsWidth - CARD_WIDTH - MARGIN);
  const fy = Math.min(Math.max(y - CARD_HEIGHT - 10, MARGIN), boundsHeight - CARD_HEIGHT - MARGIN);

  return (
    <foreignObject x={fx} y={fy} width={CARD_WIDTH} height={CARD_HEIGHT} className="pointer-events-none overflow-visible">
      <div className="flex h-full flex-col gap-0.5 overflow-hidden rounded-md border border-border-strong bg-surface px-2 py-1.5 text-[9px] leading-snug shadow-lg">
        <p className="line-clamp-2 font-medium text-text-primary">{preview.heading}</p>
        {preview.lines.map((line, i) => (
          <p key={i} className="truncate text-text-tertiary">
            {line}
          </p>
        ))}
      </div>
    </foreignObject>
  );
}
