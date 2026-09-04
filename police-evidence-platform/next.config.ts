import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-mode only: without this, Next blocks HMR/static-chunk requests
  // that arrive from any host other than the one it thinks it's serving
  // (localhost) — which is every request from the tablet capture flow,
  // since that's the whole point of accessing this dev server over LAN.
  // Safe here because this only ever runs on a controlled event-venue
  // network, not the public internet.
  allowedDevOrigins: ["10.41.164.40"],
  // Ships a native binary — Turbopack otherwise tries to parse the
  // executable itself as JS source and fails. Use native require instead
  // of bundling, per Next's own serverExternalPackages docs.
  serverExternalPackages: [
    "@ffprobe-installer/ffprobe",
    "@ffprobe-installer/linux-x64",
    "@ffmpeg-installer/ffmpeg",
    "@ffmpeg-installer/linux-x64",
    // Also ships a compiled native addon (dist/binary.js) — same
    // "Turbopack can't place a non-ESM binary in a chunk" failure as the
    // ffprobe/ffmpeg binaries above, only caught now because this was the
    // first full `next build` run since C2PA was wired in (npm run dev
    // handles it more lazily and never surfaced the error).
    "@contentauth/c2pa-node",
    // Spawns/talks to a real Chrome process over a native pipe/websocket —
    // same "Turbopack can't bundle this" class of package as the others
    // above.
    "puppeteer-core",
    // pdfjs-dist (pdf-parse's dependency) dynamically resolves its worker
    // script at runtime by path — Turbopack rewrites that path during
    // bundling, so the worker file it tries to `import()` doesn't exist at
    // the rewritten location ("Cannot find module .../pdf.worker.mjs").
    // Native require sidesteps the rewrite, same fix as the others above.
    "pdf-parse",
    "pdfjs-dist",
    // Loads its .dat lookup tables via a path.resolve(__dirname, ...)
    // relative to its own package directory — same "Turbopack rewrites the
    // path during bundling" failure as the packages above, surfacing as
    // ENOENT on a bogus "/ROOT/node_modules/geoip-lite/data/..." path.
    "geoip-lite",
  ],
};

export default nextConfig;
