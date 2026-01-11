import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: ["packages/ui/styles"],
  },
  turbopack: {},
};

export default nextConfig;
