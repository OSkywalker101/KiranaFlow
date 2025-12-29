import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Priority:
        // 1. Next.js API Routes (src/app/api/...)
        // 2. This Proxy -> Backend
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
