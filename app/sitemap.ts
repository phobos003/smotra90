import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://visota90.ru"
  const today = new Date()
  return [
    { url: `${base}/`, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/rules`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/location`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
  ]
}
