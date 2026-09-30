import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import ChatWidget from "@/components/chat/ChatWidget";
import Nav from "@/components/Nav";
import PrefsBoot from "@/components/PrefsBoot";
import Footer from "@/components/sections/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { profile } from "@/lib/data";
import { seo } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap", preload: false });

const { title, description } = seo;

// The chat assistant only appears once its API key is configured (read at build time).
const chatEnabled = Boolean(process.env.ANTHROPIC_API_KEY);
// Vercel serves the analytics scripts; elsewhere (local `next start`) they would 404.
const onVercel = Boolean(process.env.VERCEL);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  applicationName: seo.siteName,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  keywords: seo.keywords,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    title,
    description,
    siteName: seo.siteName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <PrefsBoot />
        <SmoothScroll>
          <Nav />
          {children}
          <Footer />
        </SmoothScroll>
        {chatEnabled && <ChatWidget />}
        {onVercel && <Analytics />}
        {onVercel && <SpeedInsights />}
      </body>
    </html>
  );
}
