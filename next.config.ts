import type { NextConfig } from "next";

// The browser calls the Progga API directly. No /api proxy through Next.js.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "production" ? "https://proggaapi.akxens.com" : "http://localhost:4000");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: BACKEND_URL,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
