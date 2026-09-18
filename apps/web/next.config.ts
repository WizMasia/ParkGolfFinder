import type { NextConfig } from "next";

/**
 * Next.js Web App configurations
 * Next.js 웹앱 설정 구성
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@parkgolf/bot"],
  webpack: (config) => {
    if (config.resolve) {
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js", ".jsx"],
      };
    }
    return config;
  },
  // Support custom webpack rules if necessary
  // 필요한 경우 맞춤형 webpack 규칙을 제공합니다.
};

export default nextConfig;
