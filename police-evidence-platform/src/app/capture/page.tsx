import { PendingCaptureClient } from "@/components/capture/pending-capture-client";

/**
 * Fixed, public, no-token capture entry point — used from the New Case
 * wizard, before any case exists to scope a per-case link to. See the
 * PendingCapture schema comment for the (deliberately open) security
 * model. The token-scoped /capture/[token] flow for an *existing* case is
 * a separate route, unaffected by this one.
 */
export default function CapturePage() {
  return <PendingCaptureClient />;
}
