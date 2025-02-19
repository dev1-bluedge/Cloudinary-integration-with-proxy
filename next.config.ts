import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: `https://res.cloudinary.com/dcfantgjx/image/upload/v1739924540/:path*`,
      },
    ];
  },
};

export default nextConfig;
