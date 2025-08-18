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
};

export default nextConfig;
