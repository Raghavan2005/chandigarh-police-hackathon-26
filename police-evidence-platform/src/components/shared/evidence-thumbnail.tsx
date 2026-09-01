import Image from "next/image";
import { cn } from "@/lib/utils";
import type { EvidenceKind, Verdict } from "@/lib/types";
import { verdictDotClass } from "@/components/shared/verdict-badge";
import { FileText, Image as ImageIcon, Mic, Video } from "lucide-react";

export const KIND_ICON: Record<EvidenceKind, React.ElementType> = {
  image: ImageIcon,
  video: Video,
  audio: Mic,
  document: FileText,
};

export function EvidenceThumbnail({
  src,
  kind,
  verdict,
  size = 40,
  className,
}: {
  src: string;
  kind: EvidenceKind;
  verdict: Verdict;
  size?: number;
  className?: string;
}) {
  const Icon = KIND_ICON[kind];
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-[4px] border border-border-subtle bg-surface-sunken", className)}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
        <Icon className="size-2.5 text-white/90" />
      </div>
      <span
        className={cn(
          "absolute right-0.5 top-0.5 size-1.5 rounded-full ring-1 ring-black/40",
          verdictDotClass(verdict),
        )}
      />
    </div>
  );
}
