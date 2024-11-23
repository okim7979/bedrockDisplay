import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ESLint 에러 무시
  },
  i18n: {
    locales: ["en", "ko", "fr"], // 다국어 지원
    defaultLocale: "ko",
  },
};

export default nextConfig;
