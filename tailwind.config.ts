import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "enterprise-bg": "#F5F5F7",
        "enterprise-card": "#FFFFFF",
        "enterprise-text-primary": "#1d1d1f",
        "enterprise-text-secondary": "#636366",
        "enterprise-blue": "#007AFF",
        "enterprise-blue-subtle": "rgba(0, 122, 255, 0.1)",
        "enterprise-red": "#FF3B30",
        "enterprise-success": "#34C759",
        "enterprise-border": "#E5E5EA",
      },
      boxShadow: {
        "soft-card": "0 4px 20px rgba(0,0,0,0.04)",
        "hover-card": "0 8px 30px rgba(0,0,0,0.08)",
        "glow-blue": "0 4px 12px rgba(0,122,255,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
