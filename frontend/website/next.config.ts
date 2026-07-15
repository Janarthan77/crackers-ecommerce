import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/combo-offers',
        destination: '/',
        permanent: false, // Temporary redirect just in case a dedicated page is built later
      },
    ];
  },
};

export default nextConfig;
