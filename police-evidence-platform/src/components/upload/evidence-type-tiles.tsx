"use client";

import { cn } from "@/lib/utils";
import type { EvidenceKind } from "@/lib/types";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";

const TYPES: { kind: EvidenceKind; label: string; description: string }[] = [
  {
    kind: "image",
    label: "Image",
    description: "Photos, screenshots, memes, forwarded stills",
  },
  {
    kind: "video",
    label: "Video",
    description: "Clips, reels, broadcast footage",
  },
  {
    kind: "audio",
    label: "Audio",
    description: "Voice notes, calls, synthetic speech",
  },
  {
    kind: "document",
    label: "Document",
    description: "Scanned notices, orders, PDFs",
  },
];

export function EvidenceTypeTiles({
  value,
  onChange,
}: {
  value: EvidenceKind | null;
  onChange: (kind: EvidenceKind) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TYPES.map(({ kind, label, description }) => {
        const Icon = KIND_ICON[kind];
        const active = value === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onChange(kind)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              active
                ? "border-accent-primary bg-accent-dim"
                : "border-border-subtle bg-surface hover:border-border-strong",
            )}
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-md",
                active ? "bg-accent-primary text-white" : "bg-surface-raised text-text-secondary",
              )}
            >
              <Icon className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-[11px] leading-snug text-text-tertiary">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
