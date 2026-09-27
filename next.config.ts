import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.*", "127.0.0.1"],
  images: {
    localPatterns: [{ pathname: "/api/review-image" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oss.sazito.com",
        pathname: "/apiuploads/*/**",
      },
      {
        protocol: "https",
        hostname: "sazito-file-manager-production-tajrobe.s3.ir-thr-at1.arvanstorage.ir",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
