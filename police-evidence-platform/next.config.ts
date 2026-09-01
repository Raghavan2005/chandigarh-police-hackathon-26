import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ships a native binary — Turbopack otherwise tries to parse the
  // executable itself as JS source and fails. Use native require instead
  // of bundling, per Next's own serverExternalPackages docs.
  serverExternalPackages: ["@ffprobe-installer/ffprobe", "@ffprobe-installer/linux-x64"],
};

export default nextConfig;
