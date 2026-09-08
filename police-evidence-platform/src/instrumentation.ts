/**
 * Runs once when the Next.js server process starts (real Next.js
 * instrumentation hook, not a custom bootstrap script). Fixes a real,
 * observed failure: Google Cloud's Node auth library (used by every
 * Vertex AI/Gemini call — image description, web search grounding, etc.)
 * hit `ETIMEDOUT` calling https://oauth2.googleapis.com/token, surfaced to
 * investigators as "Image description failed... credential invalid" even
 * though the credential was fine. Root cause, confirmed live: this host
 * resolves oauth2.googleapis.com's IPv6 address first (Node's default DNS
 * order), but outbound IPv6 to Google is broken/unreachable in this
 * environment while IPv4 works instantly — Node was hanging on the dead
 * IPv6 route instead of falling back. Forcing IPv4-first DNS resolution
 * for the whole process is the standard fix for this exact class of
 * "works over curl -4, times out over Node" failure.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
