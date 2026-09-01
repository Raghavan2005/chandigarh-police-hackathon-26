import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookie, verifySessionToken, type SessionPayload } from "@/lib/auth";

/** Server-only — reads and verifies the session cookie. Never trusts client-provided headers. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(sessionCookie.name)?.value);
}

/**
 * Route-handler guard (PS4_MVP_BUILD_PLAN.md §2 — "no unauthenticated path
 * to any case data"). Usage:
 *
 *   const session = await requireSession();
 *   if (session instanceof NextResponse) return session;
 *
 * Returning the error response itself (rather than throwing) keeps route
 * handlers explicit about the unauthenticated case instead of relying on a
 * try/catch to paper over it.
 */
export async function requireSession(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  return session;
}

/** Same pattern as requireSession, additionally enforcing role — e.g. the
 * global audit log is admin-only per §2's authorization note. */
export async function requireRole(role: string): Promise<SessionPayload | NextResponse> {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (session.role !== role) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }
  return session;
}
