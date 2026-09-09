"use client";

import { Suspense, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoginCarousel } from "@/components/login/login-carousel";

const EMAIL_DOMAIN = "@chandigarhpolice.gov.in";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(EMAIL_DOMAIN);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus("error");
      setErrorMessage(body?.error ?? "Could not reach the server. Try again.");
      return;
    }

    const next = searchParams.get("next") ?? "/";
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <LoginCarousel />

      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image src="/Chandigarh_Police_Logo.png" alt="Chandigarh Police" width={48} height={48} />
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Pramana</h1>
            <p className="text-xs text-text-tertiary">
              Forensic Evidence Platform — investigator sign-in
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              ref={emailInputRef}
              id="email"
              type="text"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => {
                // Prefilled with just "@chandigarhpolice.gov.in" — put the
                // caret before it so typing prepends the username instead
                // of landing after the domain.
                if (e.target.value === EMAIL_DOMAIN) {
                  e.target.setSelectionRange(0, 0);
                }
              }}
              disabled={status === "submitting"}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === "submitting"}
            />
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-status-critical">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={status === "submitting"}
            className="mt-1 justify-center bg-accent-primary text-white hover:bg-accent-primary-hover"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                Sign in
              </>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-text-tertiary">
          Access is restricted to authorized investigators. Accounts are
          provisioned by an administrator — there is no public sign-up.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
