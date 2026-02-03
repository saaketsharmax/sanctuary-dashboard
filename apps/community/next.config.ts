import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sanctuary/ui", "@sanctuary/database"],
};

export default nextConfig;
