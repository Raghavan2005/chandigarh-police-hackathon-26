"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { AlertTriangle, Loader2, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CaptureLinkState {
  url: string;
  expiresAt: string;
}

/**
 * Mints a short-lived tablet capture link (CaptureLink — see schema
 * comment) and renders it as a QR code, generated entirely client-side
 * (qrcode's canvas API, no network call) so it works with no internet on
 * stage. Raw URL shown underneath as a fallback if scanning fails live.
 */
export function CaptureLinkDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [link, setLink] = useState<CaptureLinkState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function generateLink() {
    setStatus("loading");
    setErrorMessage("");

    const response = await fetch(`/api/cases/${caseId}/capture-link`, { method: "POST" }).catch(() => null);
    const body = await response?.json().catch(() => null);
    if (!response || !response.ok) {
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not generate a capture link — try again.");
      return;
    }

    setLink({ url: body.url, expiresAt: body.expiresAt });
    setStatus("ready");
  }

  useEffect(() => {
    if (status === "ready" && link && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, link.url, { width: 220, margin: 1 }).catch(() => {
        setStatus("error");
        setErrorMessage("Generated the link but couldn't render the QR code — use the URL below instead.");
      });
    }
  }, [status, link]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && status === "idle") void generateLink();
        if (!next) {
          setStatus("idle");
          setLink(null);
        }
      }}
    >
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        <QrCode className="size-4" />
        Capture from tablet
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Capture from tablet</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Scan this on a tablet or phone — no login needed. It opens a camera page scoped to this case only; the
            photo uploads and runs detection automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          {status === "loading" && <Loader2 className="size-8 animate-spin text-text-tertiary" />}

          {status === "error" && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {errorMessage}
            </p>
          )}

          {status === "ready" && link && (
            <>
              <canvas ref={canvasRef} className="rounded-lg border border-border-subtle bg-white p-2" />
              <p className="w-full break-all rounded-md border border-border-subtle bg-surface-sunken px-2 py-1.5 text-center text-xs text-text-tertiary select-all">
                {link.url}
              </p>
              <p className="text-xs text-text-tertiary">
                Expires {new Date(link.expiresAt).toLocaleTimeString()}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
