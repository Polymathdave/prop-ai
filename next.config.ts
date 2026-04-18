import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-e0ef2403878e4f15bc76e140f6eb8081.r2.dev',
      },
    ],
  },
};
export default nextConfig;
