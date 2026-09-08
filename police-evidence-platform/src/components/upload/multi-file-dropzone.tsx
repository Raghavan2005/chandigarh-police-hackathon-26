"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import { KIND_ICON } from "@/components/shared/evidence-thumbnail";
import { formatBytes } from "@/components/upload/upload-dropzone";
import { inferEvidenceKind, type EvidenceKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface QueuedFile {
  id: string;
  file: File;
  kind: EvidenceKind;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

/** Builds queued entries from a raw file list, silently classifying each by
 * its own MIME type — a file this platform doesn't recognize is dropped
 * from the returned list (surfaced via `rejected`) rather than queued with
 * a kind it doesn't have. */
export function classifyFiles(files: File[]): { queued: QueuedFile[]; rejected: File[] } {
  const queued: QueuedFile[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    const kind = inferEvidenceKind(file.type);
    if (!kind) {
      rejected.push(file);
      continue;
    }
    queued.push({ id: crypto.randomUUID(), file, kind, status: "pending" });
  }
  return { queued, rejected };
}

/**
 * Multi-file drag-and-drop for case creation — one case can now start with
 * several exhibits of different kinds at once (an image, a video, and a
 * PDF in the same drop), each auto-classified by its own MIME type instead
 * of requiring one kind pre-selected for the whole batch. Upload
 * orchestration (sequential POSTs, per-file retry) lives in the caller
 * (cases/new/page.tsx) — this component only owns the drop target and the
 * queued-file list's display.
 */
export function MultiFileDropzone({
  queued,
  onAdd,
  onRemove,
  disabled,
}: {
  queued: QueuedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) onAdd(Array.from(e.dataTransfer.files ?? []));
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          dragOver
            ? "border-accent-primary bg-accent-dim"
            : "border-border-subtle bg-surface-sunken hover:border-border-strong",
        )}
      >
        <input
          type="file"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            onAdd(Array.from(e.target.files ?? []));
            e.target.value = ""; // lets the same file be re-added after a remove
          }}
        />
        <UploadCloud className="size-7 text-text-tertiary" />
        <p className="text-sm text-text-secondary">
          Drag and drop one or more files here, or <span className="text-accent-primary">browse files</span>
        </p>
        <p className="text-[11px] text-text-tertiary">
          A mix of images, videos, audio, and documents is fine — each becomes its own exhibit on this case.
          Accepted: JPG, PNG, MP4, MOV, MP3, WAV, PDF, TXT — max 500MB each.
        </p>
      </label>

      {queued.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {queued.map((q) => {
            const Icon = KIND_ICON[q.kind];
            const removable = !disabled && (q.status === "pending" || q.status === "error");
            return (
              <li
                key={q.id}
                className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2"
              >
                <Icon className="size-4 shrink-0 text-text-tertiary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{q.file.name}</p>
                  <p className="truncate text-[11px] text-text-tertiary">
                    {q.kind} · {formatBytes(q.file.size)}
                  </p>
                  {q.status === "error" && q.error && <p className="text-[11px] text-status-critical">{q.error}</p>}
                </div>
                {q.status === "uploading" && <Loader2 className="size-4 shrink-0 animate-spin text-text-tertiary" />}
                {q.status === "done" && <CheckCircle2 className="size-4 shrink-0 text-status-safe" />}
                {q.status === "error" && <AlertTriangle className="size-4 shrink-0 text-status-critical" />}
                {removable && (
                  <button
                    type="button"
                    onClick={() => onRemove(q.id)}
                    aria-label={`Remove ${q.file.name}`}
                    className="shrink-0 rounded p-0.5 text-text-tertiary transition-colors hover:bg-surface-sunken hover:text-text-primary"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
