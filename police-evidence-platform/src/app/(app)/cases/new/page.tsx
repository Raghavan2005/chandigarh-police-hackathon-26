"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepperHeader } from "@/components/upload/stepper-header";
import { EvidenceTypeTiles } from "@/components/upload/evidence-type-tiles";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { buttonVariants } from "@/components/ui/button";
import type { EvidenceKind } from "@/lib/types";
import { FEATURED_CASE_ID } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Link2, Loader2, ShieldCheck } from "lucide-react";

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(
    "Viral video — fabricated Modi–Netanyahu warning quote",
  );
  const [postUrl, setPostUrl] = useState("x.com/InsiderWB");
  const [priority, setPriority] = useState("high");
  const [kind, setKind] = useState<EvidenceKind | null>("video");
  const [uploaded, setUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitTimerRef = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(submitTimerRef.current);
  }, []);

  const handleSubmit = () => {
    setSubmitting(true);
    submitTimerRef.current = window.setTimeout(() => {
      router.push(`/cases/${FEATURED_CASE_ID}`);
    }, 1800);
  };

  const canNext =
    (step === 0 && title.trim().length > 0) ||
    (step === 1 && kind !== null && uploaded) ||
    step === 2;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">New Case</h1>
        <p className="text-sm text-text-tertiary">
          Create a case and submit evidence for AI-assisted forensic analysis.
        </p>
      </div>

      <StepperHeader step={step} />

      <Card className="border-border-subtle bg-surface p-6 shadow-none">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title" className="text-text-secondary">
                Case title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Viral video — fabricated Modi–Netanyahu warning quote"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="desc" className="text-text-secondary">
                Description
              </Label>
              <textarea
                id="desc"
                rows={3}
                defaultValue="Video circulating with a fabricated quote attributed to PM Modi warning Netanyahu about a Saudi-Turkey-Pakistan alliance. Flagged for manipulation analysis after viral spread from an account with a documented history of fabricated content."
                className="w-full resize-none rounded-lg border border-border-subtle bg-transparent px-2.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-border-strong"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-text-secondary">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(String(v))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-sm font-medium text-text-secondary">
                Evidence type
              </p>
              <EvidenceTypeTiles value={kind} onChange={setKind} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="postUrl2" className="text-text-secondary">
                Source post link{" "}
                <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-tertiary" />
                <Input
                  id="postUrl2"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="e.g. x.com/handle/status/1234567890"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-text-secondary">
                Upload file
              </p>
              <UploadDropzone onComplete={() => setUploaded(true)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-status-safe/30 bg-status-safe-bg px-3 py-2 text-status-safe">
              <ShieldCheck className="size-4" />
              <p className="text-sm">
                Evidence hashed and ready. Submitting will start the automated
                analysis pipeline.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-text-tertiary">Case title</dt>
              <dd className="text-text-primary">{title}</dd>
              {postUrl.trim() && (
                <>
                  <dt className="text-text-tertiary">Source post link</dt>
                  <dd className="truncate font-mono text-text-primary">{postUrl}</dd>
                </>
              )}
              <dt className="text-text-tertiary">Priority</dt>
              <dd className="capitalize text-text-primary">{priority}</dd>
              <dt className="text-text-tertiary">Evidence type</dt>
              <dd className="capitalize text-text-primary">{kind}</dd>
              <dt className="text-text-tertiary">Assigned to</dt>
              <dd className="text-text-primary">Raghavan (you)</dd>
              <dt className="text-text-tertiary">Case ID (auto-generated)</dt>
              <dd className="font-mono text-text-primary">{FEATURED_CASE_ID}</dd>
            </dl>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            step === 0 && "invisible",
          )}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {step < 2 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => Math.min(2, s + 1))}
            className={buttonVariants({
              size: "sm",
              className: "bg-accent-primary text-white hover:bg-accent-primary-hover",
            })}
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className={buttonVariants({
              size: "sm",
              className: "bg-accent-primary text-white hover:bg-accent-primary-hover",
            })}
          >
            Submit &amp; Investigate
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-canvas"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Image
                src="/Chandigarh_Police_Logo.png"
                alt="Chandigarh Police"
                width={72}
                height={72}
              />
            </motion.div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 className="size-4 animate-spin text-accent-primary" />
              Submitting case and starting analysis pipeline…
            </div>
            <p className="text-xs text-text-tertiary">
              Chandigarh Police — Pramana Forensic Evidence Platform
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
