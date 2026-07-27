import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 계정 귀속 페이지·API는 색인 제외
        disallow: ["/api/", "/documents", "/status", "/profile"],
      },
    ],
    sitemap: "https://visa-korean.com/sitemap.xml",
  };
}
