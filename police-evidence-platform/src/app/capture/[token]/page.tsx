import { validateCaptureLink } from "@/lib/capture-link";
import { CaptureClient } from "@/components/capture/capture-client";

/**
 * Public — outside (app), no session cookie required. See CaptureLink
 * schema comment and api/capture/[token]/route.ts for the security model.
 * This page's own validation is a UX nicety only; the upload route
 * re-validates the token itself as the real authorization boundary.
 */
export default async function CapturePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await validateCaptureLink(token);

  if (!link) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken p-6 text-center">
        <p className="max-w-sm text-sm text-text-tertiary">
          This capture link has expired or is invalid — ask the investigator to generate a new one.
        </p>
      </div>
    );
  }

  return <CaptureClient token={token} caseTitle={link.case.title} caseDisplayId={link.caseId} />;
}
