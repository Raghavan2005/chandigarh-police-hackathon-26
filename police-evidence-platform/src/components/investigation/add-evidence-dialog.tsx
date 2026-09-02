"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
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
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { cn } from "@/lib/utils";

/**
 * Adds a new exhibit to an already-created case — previously the only way
 * to upload evidence was the new-case wizard, which uploads exactly one
 * file at case creation and has no way back in. `POST /api/cases/:id/
 * evidence` already supported additional uploads (it's the same route the
 * wizard calls), it just had no second entry point in the real UI.
 */
export function AddEvidenceDialog({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [deviceIdentifier, setDeviceIdentifier] = useState("");
  const [casePropertyNumber, setCasePropertyNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function reset() {
    setFile(null);
    setDeviceIdentifier("");
    setCasePropertyNumber("");
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit() {
    if (!file) {
      setStatus("error");
      setErrorMessage("Choose a file first.");
      return;
    }
    setStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);
    if (deviceIdentifier.trim()) formData.append("deviceIdentifier", deviceIdentifier.trim());
    if (casePropertyNumber.trim()) formData.append("casePropertyNumber", casePropertyNumber.trim());

    const response = await fetch(`/api/cases/${caseId}/evidence`, { method: "POST", body: formData }).catch(
      () => null,
    );
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Upload failed — check your connection and try again.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        <Plus className="size-4" />
        Add evidence
      </DialogTrigger>
      <DialogContent className="border-border-subtle bg-surface-raised text-text-primary sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add evidence to this case</DialogTitle>
          <DialogDescription className="text-text-tertiary">
            Uploads a new exhibit onto {caseId} — the same real hashing/upload path as case creation, just
            reachable after the case already exists.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <UploadDropzone onComplete={setFile} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-ev-device" className="text-text-secondary">
                Device identifier <span className="font-normal text-text-tertiary">(only if seized, optional)</span>
              </Label>
              <Input
                id="add-ev-device"
                value={deviceIdentifier}
                onChange={(e) => setDeviceIdentifier(e.target.value)}
                placeholder="IMEI / MAC / serial"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-ev-property" className="text-text-secondary">
                Case property no. <span className="font-normal text-text-tertiary">(Malkhana, optional)</span>
              </Label>
              <Input
                id="add-ev-property"
                value={casePropertyNumber}
                onChange={(e) => setCasePropertyNumber(e.target.value)}
              />
            </div>
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
            disabled={!file || status === "uploading"}
            className="bg-accent-primary text-white hover:bg-accent-primary-hover"
          >
            {status === "uploading" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {status === "uploading" ? "Uploading…" : "Add evidence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
