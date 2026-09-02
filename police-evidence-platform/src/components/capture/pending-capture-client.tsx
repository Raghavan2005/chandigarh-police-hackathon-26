"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "uploading" | "done" | "error";

/**
 * Public, fixed-URL capture page (no token, no case) — see PendingCapture
 * schema comment. Posts to /api/pending-capture; a New Case wizard open on
 * the laptop polls for it and pulls it into its form automatically. No
 * verdict shown here (no case/detection exists yet at this point) — just
 * confirmation the photo made it to the server.
 */
export function PendingCaptureClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFileSelected(file: File) {
    setStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/pending-capture", { method: "POST", body: formData }).catch(() => null);
    const body = await response?.json().catch(() => null);

    if (!response || !response.ok) {
      setStatus("error");
      setErrorMessage(body?.error ?? "Upload failed — check your connection and try again.");
      return;
    }

    setStatus("done");
  }

  function reset() {
    setStatus("idle");
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-sunken p-6 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Tablet capture</p>
        <h1 className="mt-1 text-lg font-semibold text-text-primary">Pramana — new case photo</h1>
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
          <p className="text-sm text-text-tertiary">Sending to laptop…</p>
        </div>
      )}

      {status === "done" && (
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <CheckCircle2 className="size-10 text-status-safe" />
          <p className="text-sm text-text-tertiary">Sent — check the laptop, it should appear there shortly.</p>
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
