import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (repo has multiple lockfiles).
  turbopack: { root: __dirname },
};

export default nextConfig;
