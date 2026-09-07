import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kontakt.az',
      },
      {
        protocol: 'https',
        hostname: 'api.motoelan.com',
      },
    ],
  },
};

export default nextConfig;
