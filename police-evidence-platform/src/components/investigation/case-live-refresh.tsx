"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Renders nothing — just polls router.refresh() so a case page picks up
 * evidence uploaded from another device (the tablet capture flow) without
 * anyone touching this tab. router.refresh() re-fetches Server Component
 * data while preserving client state/scroll position, so this doesn't
 * flicker or jump. Always-on while a case page is open — this is a small
 * local app, not worth gating behind "is a capture link active."
 */
export function CaseLiveRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
