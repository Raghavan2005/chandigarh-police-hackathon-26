"use client";

import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/types";

const SEGMENTS = 10;

const VERDICT_COLOR: Record<Verdict, string> = {
  AUTHENTIC: "bg-status-safe",
  MANIPULATED: "bg-status-critical",
  AI_GENERATED: "bg-status-critical",
  INCONCLUSIVE: "bg-status-inconclusive",
};

export function ConfidenceMeter({
  confidence,
  verdict,
  showLabel = true,
  className,
}: {
  confidence: number;
  verdict: Verdict;
  showLabel?: boolean;
  className?: string;
}) {
  const filled = Math.round((confidence / 100) * SEGMENTS);
  const color = VERDICT_COLOR[verdict];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex gap-1">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 w-2.5 rounded-[2px] transition-colors duration-300",
              i < filled ? color : "bg-border-subtle",
            )}
            style={{ transitionDelay: `${i * 30}ms` }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="font-mono text-sm text-text-primary tabular-nums">
          {confidence}%
        </span>
      )}
    </div>
  );
}
