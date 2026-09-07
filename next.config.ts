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
        hostname: 'pub-cb8fb86f549343468a5fd508f1ad9a4a.r2.dev',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
