import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for server actions to handle large images
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Allow external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
// force restart
