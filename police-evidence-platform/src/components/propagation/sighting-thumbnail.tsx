"use client";

import { useState } from "react";
import { FileQuestion, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small thumbnail for a propagation sighting. Reuses the exact gate from
 * RealEvidenceViewer (real-evidence-viewer.tsx) — sensitive evidence never
 * has its file URL rendered as an <img> until POST .../reveal succeeds and
 * writes an audit entry, so a cross-case match can't leak an NCII/minor
 * image just because it showed up in this list.
 */
export function SightingThumbnail({
  caseId,
  evidenceId,
  mimeType,
  sensitivityLevel,
}: {
  caseId: string;
  evidenceId: string;
  mimeType: string;
  sensitivityLevel: string;
}) {
  const isSensitive = sensitivityLevel !== "standard";
  const [revealed, setRevealed] = useState(!isSensitive);
  const [revealing, setRevealing] = useState(false);

  const isImage = mimeType.startsWith("image/");
  const fileUrl = `/api/cases/${caseId}/evidence/${evidenceId}/file`;

  async function handleReveal() {
    setRevealing(true);
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/reveal`, { method: "POST" }).catch(
      () => null,
    );
    setRevealing(false);
    if (response?.ok) setRevealed(true);
  }

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={handleReveal}
        disabled={revealing}
        title={`Flagged ${sensitivityLevel} — viewing is logged`}
        className="flex size-12 shrink-0 items-center justify-center rounded-md border border-status-warning/40 bg-black/90"
      >
        <Lock className="size-4 text-status-warning" />
      </button>
    );
  }

  if (!isImage) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-sunken">
        <FileQuestion className="size-4 text-text-tertiary" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fileUrl}
      alt=""
      className={cn("size-12 shrink-0 rounded-md border border-border-subtle bg-black object-cover")}
    />
  );
}
