import type { Metadata, Viewport } from "next";
import { LangProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-Visa Assist",
  description: "AI visa consultation & filing by a licensed attorney and administrative agent in Korea",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <LangProvider>
          <div className="phone">{children}</div>
        </LangProvider>
      </body>
    </html>
  );
}
