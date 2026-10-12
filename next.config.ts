import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/presentations/export": ["./server/presentations/fonts/*"],
  },
  allowedDevOrigins: ["127.0.0.1"],
};
export default nextConfig;
