"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "uploading" | "done" | "error";

interface CaptureResult {
  verdict?: string;
  confidence?: number;
  explanation?: string;
}

/**
 * Camera-first, no-login capture UI (see api/capture/[token]/route.ts) —
 * <input capture="environment"> rather than a custom getUserMedia/canvas
 * preview: fewer moving parts to fail live on stage, works on Android
 * Chrome and iPadOS Safari without extra permission-prompt handling. On
 * file select, uploads immediately (no separate confirm tap) and the same
 * response carries the real fusion verdict, since the route awaits
 * detection before responding.
 */
export function CaptureClient({
  token,
  caseTitle,
  caseDisplayId,
}: {
  token: string;
  caseTitle: string;
  caseDisplayId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFileSelected(file: File) {
    setStatus("uploading");
    setErrorMessage("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/capture/${token}`, { method: "POST", body: formData }).catch(() => null);
    const body = await response?.json().catch(() => null);

    if (!response || (!response.ok && response.status !== 207)) {
      setStatus("error");
      setErrorMessage(body?.error ?? "Upload failed — check your connection and try again.");
      return;
    }

    setResult(body);
    setStatus("done");
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-sunken p-6 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Tablet capture</p>
        <h1 className="mt-1 text-lg font-semibold text-text-primary">{caseTitle}</h1>
        <p className="font-mono text-xs text-text-tertiary">{caseDisplayId}</p>
      </div>

      {status === "idle" && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileSelected(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-32 items-center justify-center rounded-full border-2 border-dashed border-border-subtle bg-surface text-text-tertiary transition-colors hover:border-accent-primary hover:text-accent-primary"
          >
            <Camera className="size-12" />
          </button>
          <p className="text-sm text-text-tertiary">Tap to take a photo</p>
        </>
      )}

      {status === "uploading" && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-accent-primary" />
          <p className="text-sm text-text-tertiary">Uploading and analyzing…</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <CheckCircle2 className="size-10 text-status-safe" />
          {result.verdict ? (
            <div className="w-full rounded-lg border border-border-subtle bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Verdict</p>
              <p className="mt-1 text-base font-semibold text-text-primary">{result.verdict}</p>
              {typeof result.confidence === "number" && (
                <p className="text-xs text-text-tertiary">{result.confidence}% confidence</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">{result.explanation ?? "Captured."}</p>
          )}
          <Button size="sm" onClick={reset}>
            Take another photo
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="size-10 text-status-critical" />
          <p role="alert" className="max-w-xs text-sm text-status-critical">
            {errorMessage}
          </p>
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
