import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:5000/api/:path*", // Should match docker service name
      },
    ];
  },
};

export default nextConfig;
