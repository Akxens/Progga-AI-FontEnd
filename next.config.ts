import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: BACKEND_URL,
  },
  // The browser only ever talks to this origin; /api is proxied to the Node
  // backend so the auth cookie stays first-party and httpOnly.
  experimental: {
    proxyTimeout: 130_000,
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
