import type { Metadata } from "next";
import "./globals.css";

/**
 * Metadata configuration for SEO optimization
 * SEO 최적화를 위한 메타데이터 설정
 */
export const metadata: Metadata = {
  title: "ParkGolfFinder - 전국 파크골프장 위치 및 예약 정보",
  description: "전국에 있는 파크골프 시설 목록과 세부 예약 방법, 요금 요약을 빠르게 검색해 보세요.",
};

/**
 * Root Layout structure wrap
 * 글로벌 루트 레이아웃 감싸기 구조
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
