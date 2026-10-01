import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";
import { profile } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [`${siteUrl}${profile.photo}`, `${siteUrl}/opengraph-image`],
    },
    ...caseStudies.map((c) => ({
      url: `${siteUrl}/work/${c.slug}`,
      lastModified: new Date(c.updated ?? c.published),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [`${siteUrl}/work/${c.slug}/opengraph-image`],
    })),
  ];
}
