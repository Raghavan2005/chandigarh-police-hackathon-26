"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Camera } from "lucide-react";

/**
 * Polls the public, no-token PendingCapture holding area (see schema
 * comment) and hands off the first unconsumed photo to the New Case
 * wizard. Shows a QR/link to the fixed /capture page — no server round
 * trip to generate it, since there's no per-case token here at all.
 */
export function TabletCaptureHint({ onCaptured }: { onCaptured: (file: File) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capturedRef = useRef(false);
  const [received, setReceived] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Not window.location.origin — that's whatever host the laptop's own
  // browser happens to be on (often localhost, unreachable from a tablet
  // on the same WiFi). /api/lan-url resolves the actual LAN-reachable
  // address server-side instead.
  const [captureUrl, setCaptureUrl] = useState("");

  useEffect(() => {
    fetch("/api/lan-url")
      .then((r) => r.json())
      .then((d) => setCaptureUrl(`${d.origin}/capture`))
      .catch(() => setCaptureUrl(`${window.location.origin}/capture`));
  }, []);

  useEffect(() => {
    if (canvasRef.current && captureUrl) {
      QRCode.toCanvas(canvasRef.current, captureUrl, { width: 140, margin: 1 }).catch(() => {});
    }
  }, [captureUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const id = setInterval(async () => {
      if (capturedRef.current) return;
      const res = await fetch("/api/pending-capture/latest").catch(() => null);
      const body = await res?.json().catch(() => null);
      const pending = body?.pending;
      if (!pending || capturedRef.current) return;

      capturedRef.current = true;
      const fileRes = await fetch(`/api/pending-capture/${pending.id}/file`).catch(() => null);
      if (!fileRes || !fileRes.ok) {
        capturedRef.current = false;
        return;
      }
      const blob = await fileRes.blob();
      const file = new File([blob], "tablet-capture.jpg", { type: pending.mimeType });
      await fetch(`/api/pending-capture/${pending.id}/consume`, { method: "POST" }).catch(() => {});
      setPreviewUrl(URL.createObjectURL(blob));
      setReceived(true);
      onCaptured(file);
    }, 3000);
    return () => clearInterval(id);
  }, [onCaptured]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-sunken p-3">
      {received && previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: object URL, not a static/remote asset next/image can optimize
        <img
          src={previewUrl}
          alt="Captured from tablet"
          className="size-[140px] shrink-0 rounded-md border border-border-subtle object-cover"
        />
      ) : (
        <canvas ref={canvasRef} className="rounded-md border border-border-subtle bg-white p-1" />
      )}
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
          <Camera className="size-4" />
          Capture from tablet
        </p>
        {received ? (
          <p className="text-xs font-medium text-status-safe">Photo received from tablet ✓</p>
        ) : (
          <>
            <p className="text-xs text-text-tertiary">
              Scan on a tablet or phone — no login needed. The photo appears here automatically.
            </p>
            <p className="break-all text-[11px] text-text-tertiary select-all">{captureUrl}</p>
            <p className="text-[11px] text-text-tertiary italic">Waiting for a photo…</p>
          </>
        )}
      </div>
    </div>
  );
}
