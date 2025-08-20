import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@synoro/ui",
    "@synoro/auth",
    "@synoro/config",
    "@synoro/db",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      // Allow scripts/styles; relax in dev
      `script-src 'self' 'unsafe-inline' ${isProd ? '' : "'unsafe-eval'"} https:`.trim(),
      "style-src 'self' 'unsafe-inline' https:",
      // Allow connections (e.g., APIs, S3, analytics over https)
      "connect-src 'self' https:",
      // Media/image/font sources commonly needed
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      // Upgrade HTTP content when possible
      "upgrade-insecure-requests",
      // Opt-in to modern features only when explicitly allowed
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
