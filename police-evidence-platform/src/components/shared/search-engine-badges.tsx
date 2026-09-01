"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export const SEARCH_ENGINES = [
  "Google Images",
  "Bing Visual Search",
  "Yandex Images",
  "TinEye",
  "DuckDuckGo",
  "Baidu",
];

export function SearchEngineBadges({ done }: { done: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SEARCH_ENGINES.map((engine, i) => (
        <motion.span
          key={engine}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary"
        >
          {done ? (
            <Check className="size-2.5 text-status-safe" />
          ) : (
            <Loader2 className="size-2.5 animate-spin" />
          )}
          {engine}
        </motion.span>
      ))}
    </div>
  );
}
