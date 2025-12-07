import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack (Next.js 16 default)
  turbopack: {},
  
  // TypeScript config
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
