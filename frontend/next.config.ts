import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude test files and unnecessary node_modules from bundling
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /node_modules\/thread-stream\/(test|bench)/,
      use: 'ignore-loader',
    });

    return config;
  },
  // Suppress warnings from WalletConnect/Reown dependencies
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
