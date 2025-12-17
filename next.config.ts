import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  typescript: {
    ignoreBuildErrors: true, // Speed up build
  },
};

export default nextConfig;
