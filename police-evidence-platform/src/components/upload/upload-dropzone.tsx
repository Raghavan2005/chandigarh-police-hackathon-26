"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";

const DEMO_HASH = "9f2a7c14b8e0d3f6a51c2b9d7e4f0a3c8b6d1e2f4a7c9b0d3e6f1a4c7b8e41b";

type UploadState = "idle" | "hashing" | "done";

export function UploadDropzone({
  fileName = "viral_clip.mp4",
  fileMeta = "MP4 · 24.6 MB · 00:42",
  onComplete,
}: {
  fileName?: string;
  fileMeta?: string;
  onComplete?: () => void;
}) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const beginHashing = useCallback(() => {
    if (state !== "idle") return;
    setState("hashing");
    timerRef.current = window.setTimeout(() => {
      setState("done");
      onComplete?.();
    }, 1100);
  }, [state, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={() => state === "idle" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          beginHashing();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
          dragOver
            ? "border-accent-primary bg-accent-dim"
            : "border-border-subtle bg-surface-sunken hover:border-border-strong",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={() => beginHashing()}
        />
        <UploadCloud className="size-7 text-text-tertiary" />
        <p className="text-sm text-text-secondary">
          Drag and drop evidence here, or{" "}
          <span className="text-accent-primary">browse files</span>
        </p>
        <p className="text-[11px] text-text-tertiary">
          Accepted: JPG, PNG, MP4, MOV, MP3, WAV, PDF — max 500MB
        </p>
      </div>

      {state !== "idle" && (
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-3">
          <div>
            <p className="text-sm text-text-primary">{fileName}</p>
            <p className="text-[11px] text-text-tertiary">{fileMeta}</p>
          </div>
          <div className="text-right">
            {state === "hashing" ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-tertiary">
                <Loader2 className="size-3.5 animate-spin" />
                hashing…
              </span>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-xs text-status-safe">
                <CheckCircle2 className="size-3.5" />
                SHA-256: {DEMO_HASH.slice(0, 12)}…{DEMO_HASH.slice(-4)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
