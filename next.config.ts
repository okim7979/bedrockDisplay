import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ESLint 에러 무시
  },
  i18n: {
    locales: ["en", "ko", "fr"], // 다국어 지원
    defaultLocale: "ko",
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/middle", // 원하는 경로
        permanent: true, // 영구 리다이렉트 (301 상태)
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVICE_URL}/api/:path*`, // 환경 변수 사용
      },
    ];
  },
};

export default nextConfig;
