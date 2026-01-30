import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 隐藏左下角开发模式 "N" 按钮（点击会弹出 Route / Turbopack / Preferences 等）
  devIndicators: false,
};

export default nextConfig;
