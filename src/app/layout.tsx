import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Pretendard Variable — 자체 호스팅(public/fonts). 모든 텍스트가 이 한 폰트를 쓴다.
const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: { default: "안아수달", template: "%s · 안아수달" },
  description: "아이 발달이 걱정될 때, 검증된 자료로 함께 확인하고 가까운 발달재활 기관을 찾아드려요.",
  applicationName: "안아수달",
};

export const viewport: Viewport = {
  themeColor: "#F3F2EC",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="min-h-dvh bg-base text-body antialiased">{children}</body>
    </html>
  );
}
