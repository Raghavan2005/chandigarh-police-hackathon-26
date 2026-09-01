import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

/**
 * Hand-rolled HMAC-signed session cookie instead of NextAuth — per
 * PS4_MVP_BUILD_PLAN.md §11's open question, resolved in favor of the
 * simpler option: a credentials-only, single-app auth need doesn't
 * justify NextAuth's provider/adapter surface for the time available.
 * No unauthenticated path to any case-data route may exist — §2.
 */

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12h — a shift-length session, not a "remember me" one

export interface SessionPayload {
  userId: string;
  role: string;
  name: string;
  iat: number; // issued-at, unix seconds
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set — refusing to sign/verify sessions without it.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(payload: Omit<SessionPayload, "iat">): string {
  const full: SessionPayload = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

/** Returns the session payload if the token is well-formed, correctly signed,
 * and not expired — otherwise null. Never throws on malformed/tampered input. */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  // Constant-time comparison — a plain === on a signature check is a timing
  // side-channel; small stakes here, but there's no reason to accept one.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - payload.iat;
  if (ageSeconds > SESSION_MAX_AGE_SECONDS || ageSeconds < 0) return null;

  return payload;
}

export const sessionCookie = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_MAX_AGE_SECONDS,
};
