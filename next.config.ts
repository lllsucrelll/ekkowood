import type { NextConfig } from "next";

// Kept without per-request nonces on purpose: nonce-based CSP requires every
// page to render dynamically (no static/ISR caching), and would break the
// Google Places Autocomplete dropdown, which injects its own inline styles
// at runtime with no way to attach a nonce to them.
const isDev = process.env.NODE_ENV === "development";

// 'unsafe-eval' is dev-only: React uses eval() in development to rebuild
// server error stacks in the browser console. Neither React nor Next.js use
// eval() in production, so it's left out of the production policy.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://maps.googleapis.com https://www.google.com https://www.gstatic.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.gstatic.com https://maps.googleapis.com https://*.public.blob.vercel-storage.com;
  connect-src 'self' https://maps.googleapis.com https://www.google.com;
  frame-src https://www.google.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
