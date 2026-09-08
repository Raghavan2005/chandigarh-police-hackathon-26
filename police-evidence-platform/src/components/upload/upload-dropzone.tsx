"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";

type UploadState = "idle" | "hashing" | "done";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Real client-side hash via the Web Crypto API — computed for immediate
 * feedback (design.md's "hash appears before the investigator even clicks
 * submit" beat), but this is a preview only. The server independently
 * recomputes SHA-256 on the bytes it actually receives and stores (see
 * /api/cases/:id/evidence) — that server-side value, not this one, is what
 * chain-of-custody actually rests on.
 */
async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function UploadDropzone({
  onComplete,
  externalFile,
}: {
  onComplete?: (file: File) => void;
  /** Set from outside (e.g. a tablet capture picked up elsewhere) — shown
   * the same way a manually-dropped file would be, so there's one visual
   * source of truth instead of a second "received" indicator bolted on
   * next to the dropzone. */
  externalFile?: File | null;
}) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file || !file.type.startsWith("image/")) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    async (selected: File | undefined | null) => {
      if (!selected || state !== "idle") return;
      setError(null);
      setFile(selected);
      setState("hashing");
      try {
        const digest = await sha256Hex(selected);
        setHash(digest);
        setState("done");
        onComplete?.(selected);
      } catch {
        setState("idle");
        setFile(null);
        setError("Could not read this file. Try a different one.");
      }
    },
    [state, onComplete],
  );

  useEffect(() => {
    if (!externalFile) return;
    // Deferred a tick — handleFile's setState calls must not run
    // synchronously inside the effect body itself.
    const id = setTimeout(() => void handleFile(externalFile), 0);
    return () => clearTimeout(id);
    // Only re-run when a genuinely new external file arrives — handleFile's
    // own idle-state guard covers the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFile]);

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (state === "idle") setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
          state === "idle" ? "cursor-pointer" : "cursor-default",
          dragOver
            ? "border-accent-primary bg-accent-dim"
            : "border-border-subtle bg-surface-sunken hover:border-border-strong",
        )}
      >
        <input
          type="file"
          className="hidden"
          disabled={state !== "idle"}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <UploadCloud className="size-7 text-text-tertiary" />
        <p className="text-sm text-text-secondary">
          Drag and drop evidence here, or{" "}
          <span className="text-accent-primary">browse files</span>
        </p>
        <p className="text-[11px] text-text-tertiary">
          Accepted: JPG, PNG, MP4, MOV, MP3, WAV, PDF, TXT — max 500MB
        </p>
      </label>

      {error && <p className="text-sm text-status-critical">{error}</p>}

      {file && (
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-3">
          <div className="flex items-center gap-3">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- blob: object URL, not a static/remote asset next/image can optimize
              <img
                src={previewUrl}
                alt=""
                className="size-12 shrink-0 rounded-md border border-border-subtle object-cover"
              />
            )}
            <div>
              <p className="text-sm text-text-primary">{file.name}</p>
              <p className="text-[11px] text-text-tertiary">
                {file.type || "unknown type"} · {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <div className="text-right">
            {state === "hashing" ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-tertiary">
                <Loader2 className="size-3.5 animate-spin" />
                hashing…
              </span>
            ) : (
              hash && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-status-safe">
                  <CheckCircle2 className="size-3.5" />
                  SHA-256: {hash.slice(0, 12)}…{hash.slice(-4)}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
