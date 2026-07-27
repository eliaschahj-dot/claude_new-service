import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { LangProvider } from "@/lib/i18n";
import { Frame } from "@/components/Frame";
import { Track } from "@/components/Track";
import "./globals.css";

const SITE_URL = "https://visa-korean.com";
const TITLE = "K-Visa Assist — 한국 비자 AI 상담·발급 대행";
const DESC =
  "변호사·행정사가 직접 운영하는 한국 비자 AI 상담·발급 대행 서비스. 유학(D-2/D-4)·구직(D-10)·취업(E-7)·결혼(F-6)·영주권(F-5)까지 AI가 심층 상담하고, 서류 준비부터 출입국 접수까지 전문가가 대행합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | K-Visa Assist" },
  description: DESC,
  keywords: [
    "한국 비자", "비자 대행", "비자 상담", "행정사", "출입국", "체류자격 변경", "비자 연장",
    "영주권", "결혼비자", "E-7", "D-10", "D-2", "F-6", "F-5", "F-2-7",
    "Korea visa", "Korean visa help", "visa agency Korea", "immigration lawyer Korea",
  ],
  applicationName: "K-Visa Assist",
  authors: [{ name: "K-Visa Assist" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "K-Visa Assist",
    title: TITLE,
    description: DESC,
    locale: "ko_KR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESC,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a56db",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          <LangProvider>
            <Track />
            <Frame>{children}</Frame>
          </LangProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
