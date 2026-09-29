// Absolute site URL for metadata, sitemap and Open Graph images.
// Production uses the custom domain; previews use their own vercel.app URL.
// NEXT_PUBLIC_SITE_URL overrides both.
export const productionUrl = "https://www.kaustubhchaphekar.online";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? productionUrl
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
