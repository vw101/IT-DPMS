import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // 👈 必须有
  typescript: {
    ignoreBuildErrors: true, // 👈 建议有
  },
};

export default nextConfig;