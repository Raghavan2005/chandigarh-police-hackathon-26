const LABELS = ["W1", "", "", "W4", "", "", "W7", "", "", "W10", "", "", "W13", "", "", "W16"];

export function AnomalyTrendChart({ data }: { data: number[] }) {
  const w = 640;
  const h = 160;
  const pad = 8;
  const max = Math.max(1, ...data);
  const min = 0;
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);

  const coords = data.map((d, i) => [
    pad + i * step,
    h - pad - ((d - min) / range) * (h - pad * 2),
  ]);
  const line = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full min-w-[480px]">
        <defs>
          <linearGradient id="anomalyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={pad + f * (h - pad * 2)}
            y2={pad + f * (h - pad * 2)}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        ))}
        <polygon points={area} fill="url(#anomalyFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 3 : 0} fill="var(--accent-primary)" />
        ))}
      </svg>
      <div className="mt-1 flex min-w-[480px] justify-between px-2 font-mono text-[10px] text-text-tertiary">
        {LABELS.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}
