import type { MetadataRoute } from "next";

const BASE = "https://visa-korean.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/chat`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/visas`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
