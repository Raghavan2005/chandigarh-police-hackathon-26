"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Fingerprint,
  Loader2,
  Send,
  MessageCircle,
  Globe,
  Newspaper,
  Landmark,
  Maximize2,
} from "lucide-react";
import type { FaceMatch } from "@/lib/types";
import { SearchEngineBadges } from "@/components/shared/search-engine-badges";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function FaceThumb({ src, size = 14 }: { src: string; size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md border border-border-subtle"
      style={{ width: size * 4, height: size * 4 }}
    >
      <Image
        src={src}
        alt="Extracted face crop"
        fill
        className="scale-[2.2] object-cover object-[50%_28%]"
      />
    </div>
  );
}

function SourceIcon({
  platform,
  className,
}: {
  platform: FaceMatch["platform"];
  className?: string;
}) {
  switch (platform) {
    case "telegram":
      return <Send className={className} />;
    case "whatsapp":
      return <MessageCircle className={className} />;
    case "facebook":
      return <Globe className={className} />;
    case "news":
      return <Newspaper className={className} />;
    case "public-record":
      return <Landmark className={className} />;
    case "x":
      return <XGlyph className={className} />;
    default:
      return <Globe className={className} />;
  }
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.51 8.59L22.75 22H16.1l-5.2-6.79L4.9 22H1.64l8.03-9.18L1.25 2H8.08l4.7 6.2L18.24 2Zm-1.14 18.17h1.8L7.02 3.73H5.1l12 16.44Z" />
    </svg>
  );
}

export function FaceMatchPanel({
  faceSource,
  matches,
  scanning,
  done,
}: {
  faceSource: string;
  matches: FaceMatch[];
  scanning: boolean;
  done: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sectionOpen, setSectionOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Fingerprint className="size-4" />
        Face match — OSINT search
      </div>

      {!scanning && !done && (
        <p className="text-[11px] text-text-tertiary">
          Runs automatically once the OSINT search step starts.
        </p>
      )}

      {(scanning || done) && <SearchEngineBadges done={done} />}

      {scanning && !done && (
        <div className="flex items-center gap-3">
          <FaceThumb src={faceSource} />
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Loader2 className="size-3.5 animate-spin" />
            Matching extracted face against OSINT sources…
          </div>
        </div>
      )}

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <button
              type="button"
              onClick={() => setSectionOpen((v) => !v)}
              className="flex w-full items-center gap-3 text-left"
            >
              <FaceThumb src={faceSource} />
              <p className="flex-1 text-xs text-text-secondary">
                {matches.length} candidate matches found across OSINT sources.
              </p>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-text-tertiary transition-transform",
                  sectionOpen && "rotate-180",
                )}
              />
            </button>

            {sectionOpen && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {matches.map((m, i) => {
                const isOpen = expandedId === m.id;
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "cursor-pointer rounded-md border border-border-subtle bg-surface-raised p-3 transition-colors hover:border-border-strong",
                      isOpen && "border-accent-primary/40 sm:col-span-2",
                    )}
                    onClick={() =>
                      setExpandedId((prev) => (prev === m.id ? null : m.id))
                    }
                  >
                    <div className="flex gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border-subtle">
                        <Image src={m.avatar} alt="" fill className="object-cover" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                          <SourceIcon platform={m.platform} className="size-3 shrink-0" />
                          <span className="truncate">{m.url}</span>
                          <ChevronDown
                            className={cn(
                              "ml-auto size-3.5 shrink-0 text-text-tertiary transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                        </div>
                        <p className="truncate text-sm font-medium text-accent-primary">
                          {m.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-text-tertiary">
                          <span className="truncate">First seen {m.firstSeen}</span>
                          <span className="shrink-0 rounded-sm bg-accent-dim px-1.5 py-0.5 font-mono text-accent-primary">
                            {m.confidence}% match
                          </span>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div
                            className="flex items-center gap-3 border-t border-border-subtle pt-3 mt-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-md border border-border-subtle">
                              <Image
                                src={faceSource}
                                alt="Extracted face crop"
                                fill
                                className="scale-[2.2] object-cover object-[50%_28%]"
                              />
                              <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] uppercase tracking-wide text-white">
                                Extracted
                              </span>
                            </div>
                            <span className="text-text-tertiary">↔</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="group relative aspect-square w-24 shrink-0 cursor-zoom-in overflow-hidden rounded-md border border-border-subtle transition-all hover:border-accent-primary">
                                  <Image src={m.avatar} alt="" fill className="object-cover" />
                                  <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] uppercase tracking-wide text-white">
                                    Matched
                                  </span>
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Maximize2 className="size-4 text-white" />
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-[80vw] border-border-subtle bg-surface-raised p-0 sm:max-w-[1000px]">
                                <div className="relative h-[80vh] w-full">
                                  <Image src={m.avatar} alt={m.title} fill className="object-contain" />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <p className="text-[11px] leading-snug text-text-secondary">
                              {m.snippet}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
