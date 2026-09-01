import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  ],
};

export default nextConfig;
