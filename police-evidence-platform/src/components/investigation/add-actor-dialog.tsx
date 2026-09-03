"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PLATFORM_OPTIONS = ["telegram", "x", "facebook", "whatsapp", "news", "public-record"];

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-border-subtle bg-transparent px-2.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-border-strong";

/**
 * Tags a suspected handle/account on an investigation (Docs/Plan, Phase B).
 * Any authenticated investigator, not admin-only — a working lead, lower
 * stakes than linking a case.
 */
export function AddActorDialog({ investigationId }: { investigationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0]);
  const [handle, setHandle] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!handle.trim()) {
      setStatus("error");
      setErrorMessage("Handle is required.");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch(`/api/investigations/${investigationId}/actors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, handle: handle.trim(), note: note.trim() || undefined }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not add this actor — check your connection and try again.");
      return;
    }

    setStatus("idle");
    setOpen(false);
    setHandle("");
    setNote("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        <UserPlus className="size-4" />
        Add suspected actor
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>Suspected actor / account</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            A working lead, not a verified identity — record why this handle is suspected relevant.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="actor-platform" className="text-text-secondary">
              Platform
            </Label>
            <select
              id="actor-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="h-9 rounded-md border border-border-subtle bg-surface px-2.5 text-sm text-text-primary outline-none focus:border-border-strong"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="actor-handle" className="text-text-secondary">
              Handle
            </Label>
            <Input id="actor-handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="e.g. @InsiderWB" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="actor-note" className="text-text-secondary">
              Note <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <textarea
              id="actor-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Why is this handle suspected relevant?"
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
        {status === "error" && (
          <p role="alert" className="flex items-center gap-1.5 text-xs text-status-critical">
            <AlertTriangle className="size-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}
        <DialogFooter>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={status === "submitting"}
            className="bg-accent-primary text-white hover:bg-accent-primary-hover"
          >
            {status === "submitting" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
