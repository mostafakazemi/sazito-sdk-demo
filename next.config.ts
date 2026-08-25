import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oss.sazito.com",
        pathname: "/apiuploads/testmosi/**",
      },
    ],
  },
};

export default nextConfig;
