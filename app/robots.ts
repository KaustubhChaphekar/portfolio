import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Keep the decorative 3D stills (hero particles, robot, globe…) out of Google Images, so
      // the real portrait in /me/ is the image shown for the site. Pages still render normally.
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/fallback/", "/_next/image?url=%2Ffallback", "/hero/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
