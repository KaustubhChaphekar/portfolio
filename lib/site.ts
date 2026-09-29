// Absolute site URL for metadata, sitemap and Open Graph images.
// Set NEXT_PUBLIC_SITE_URL once you have a custom domain; Vercel's production URL is used otherwise.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
