import type { NextConfig } from "next";

// Security headers on every response. The Content-Security-Policy is set per
// request in src/proxy.ts because it carries a fresh nonce.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // API responses carry audit data; never let browsers or proxies cache them.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
