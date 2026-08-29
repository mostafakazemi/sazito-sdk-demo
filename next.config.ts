import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.*", "127.0.0.1"],
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
