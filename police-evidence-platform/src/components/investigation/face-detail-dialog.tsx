"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, ScanEye, SearchCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CachedReverseImageSearchResult } from "@/lib/reverse-image-search";
import type { CachedImageDescriptionResult } from "@/lib/image-description";

export interface FaceAnnotationData {
  label: string | null;
  reverseSearch: CachedReverseImageSearchResult | null;
  description: CachedImageDescriptionResult | null;
}

type RunStatus = "idle" | "running" | "done" | "not-configured" | "error";

/**
 * Per-face detail view — opened by clicking a face crop thumbnail in
 * RealEvidenceViewer. Everything here is scoped to that one detected face
 * (its own crop file, its own label, its own reverse-image-search/AI-
 * description cache in FaceAnnotation), not the whole exhibit — lets an
 * investigator label and search one specific person in a multi-person
 * photo instead of only ever acting on the whole scene.
 *
 * Face index → identity is not stable across a re-investigate (MTCNN
 * doesn't track face identity between runs, and probability-sort order
 * can shift slightly) — a real, accepted limitation given this build's
 * scope, not silently hidden: re-running Investigate can make a label
 * apply to a different face than the one it was set on.
 */
export function FaceDetailDialog({
  caseId,
  evidenceId,
  faceIndex,
  isScored,
  open,
  onOpenChange,
  annotation,
}: {
  caseId: string;
  evidenceId: string;
  faceIndex: number;
  isScored: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotation: FaceAnnotationData;
}) {
  const router = useRouter();
  const cropUrl = `/api/cases/${caseId}/evidence/${evidenceId}/face-crop?index=${faceIndex}`;

  const [label, setLabel] = useState(annotation.label ?? "");
  const [labelStatus, setLabelStatus] = useState<"idle" | "saving" | "error">("idle");

  const [searchStatus, setSearchStatus] = useState<RunStatus>(annotation.reverseSearch ? "done" : "idle");
  const [searchResult, setSearchResult] = useState(annotation.reverseSearch);
  const [searchError, setSearchError] = useState("");

  const [descStatus, setDescStatus] = useState<RunStatus>(annotation.description ? "done" : "idle");
  const [descResult, setDescResult] = useState(annotation.description);
  const [descError, setDescError] = useState("");

  // Re-sync when a different face is opened (dialog instance is shared
  // across faces, not remounted per face).
  const [lastFaceIndex, setLastFaceIndex] = useState(faceIndex);
  if (faceIndex !== lastFaceIndex) {
    setLastFaceIndex(faceIndex);
    setLabel(annotation.label ?? "");
    setLabelStatus("idle");
    setSearchStatus(annotation.reverseSearch ? "done" : "idle");
    setSearchResult(annotation.reverseSearch);
    setSearchError("");
    setDescStatus(annotation.description ? "done" : "idle");
    setDescResult(annotation.description);
    setDescError("");
  }

  async function saveLabel() {
    setLabelStatus("saving");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/faces/${faceIndex}/label`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    }).catch(() => null);
    if (!response || !response.ok) {
      setLabelStatus("error");
      return;
    }
    setLabelStatus("idle");
    router.refresh();
  }

  async function runSearch() {
    setSearchStatus("running");
    setSearchError("");
    const response = await fetch(
      `/api/cases/${caseId}/evidence/${evidenceId}/faces/${faceIndex}/reverse-image-search`,
      { method: "POST" },
    ).catch(() => null);
    if (!response) {
      setSearchStatus("error");
      setSearchError("Could not reach the server.");
      return;
    }
    if (response.status === 501) {
      setSearchStatus("not-configured");
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setSearchStatus("error");
      setSearchError(body?.error ?? "Search failed.");
      return;
    }
    setSearchResult(await response.json());
    setSearchStatus("done");
    router.refresh();
  }

  async function runDescribe() {
    setDescStatus("running");
    setDescError("");
    const response = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/faces/${faceIndex}/describe`, {
      method: "POST",
    }).catch(() => null);
    if (!response) {
      setDescStatus("error");
      setDescError("Could not reach the server.");
      return;
    }
    if (response.status === 501) {
      setDescStatus("not-configured");
      return;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setDescStatus("error");
      setDescError(body?.error ?? "Description failed.");
      return;
    }
    setDescResult(await response.json());
    setDescStatus("done");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto border-border-subtle bg-surface-raised text-text-primary">
        <DialogHeader>
          <DialogTitle>
            Face {faceIndex + 1}
            {isScored ? " (scored)" : ""}
          </DialogTitle>
          <DialogDescription className="text-text-tertiary">
            {isScored
              ? "The actual aligned crop the deepfake classifier scored."
              : "Detected but not separately classified by the deepfake model — it only scores one face per image."}
          </DialogDescription>
        </DialogHeader>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cropUrl}
          alt={`Face ${faceIndex + 1}`}
          className="mx-auto max-h-64 rounded-md border border-border-subtle bg-black object-contain"
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="face-label" className="text-text-secondary">
            Label
          </Label>
          <div className="flex gap-2">
            <Input
              id="face-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Suspect 1, or a name once identified"
            />
            <Button
              size="sm"
              onClick={saveLabel}
              disabled={labelStatus === "saving"}
              className="shrink-0 bg-accent-primary text-white hover:bg-accent-primary-hover"
            >
              {labelStatus === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
            </Button>
          </div>
          {labelStatus === "error" && (
            <p className="text-[11px] text-status-critical">Could not save the label — try again.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface p-2 text-xs">
          <p className="font-medium text-text-secondary">Reverse-image search (this face)</p>
          {searchStatus === "not-configured" && (
            <p className="text-text-tertiary">Not configured on this deployment (no GCP credentials set).</p>
          )}
          {searchStatus === "error" && (
            <p role="alert" className="flex items-center gap-1.5 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {searchError}
            </p>
          )}
          {!searchResult ? (
            <button
              type="button"
              onClick={runSearch}
              disabled={searchStatus === "running"}
              className={cn(buttonVariants({ variant: "outline", size: "xs" }), "w-fit")}
            >
              {searchStatus === "running" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <SearchCheck className="size-3" />
              )}
              Run search
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-text-tertiary">As of {new Date(searchResult.ranAt).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={runSearch}
                  disabled={searchStatus === "running"}
                  className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
                >
                  {searchStatus === "running" && <Loader2 className="size-3 animate-spin" />}
                  Re-run
                </button>
              </div>
              {searchResult.fullMatches.length + searchResult.partialMatches.length === 0 ? (
                <p className="text-text-tertiary">No matches found in Google&apos;s index.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {[...searchResult.fullMatches, ...searchResult.partialMatches].slice(0, 8).map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={url}
                      className="block size-12 shrink-0 overflow-hidden rounded border border-border-subtle bg-surface-sunken"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface p-2 text-xs">
          <p className="font-medium text-text-secondary">Possible identity (AI, this face)</p>
          {descStatus === "not-configured" && (
            <p className="text-text-tertiary">Not configured on this deployment (no GCP credentials set).</p>
          )}
          {descStatus === "error" && (
            <p role="alert" className="flex items-center gap-1.5 text-status-critical">
              <AlertTriangle className="size-3.5 shrink-0" />
              {descError}
            </p>
          )}
          {!descResult ? (
            <button
              type="button"
              onClick={runDescribe}
              disabled={descStatus === "running"}
              className={cn(buttonVariants({ variant: "outline", size: "xs" }), "w-fit")}
            >
              {descStatus === "running" ? <Loader2 className="size-3 animate-spin" /> : <ScanEye className="size-3" />}
              Identify
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-text-tertiary">As of {new Date(descResult.ranAt).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={runDescribe}
                  disabled={descStatus === "running"}
                  className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
                >
                  {descStatus === "running" && <Loader2 className="size-3 animate-spin" />}
                  Re-run
                </button>
              </div>
              <p className="text-text-secondary">{descResult.description}</p>
              {descResult.possibleIdentities.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {descResult.possibleIdentities.map((p, i) => (
                    <p key={i} className="text-text-secondary">
                      <span className="font-medium">{p.name}</span> — {p.confidence} confidence
                    </p>
                  ))}
                  <p className="text-[10px] text-text-tertiary">
                    AI best-effort visual judgment, not a verified identity match — treat as a lead, not a finding.
                  </p>
                </div>
              ) : (
                <p className="text-text-tertiary">No individual confidently recognizable to the model.</p>
              )}
            </>
          )}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
