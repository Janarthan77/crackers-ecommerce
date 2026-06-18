import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
