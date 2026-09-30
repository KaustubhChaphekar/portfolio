import type { CaseStudy } from "./case-studies";
import { aiAgent, education, experience, profile, services, skills } from "./data";
import { productionUrl, siteUrl } from "./site";

// Search copy. Titles stay under ~60 characters and descriptions under ~155 so Google
// shows them whole.
export const seo = {
  title: `${profile.name} — Full-Stack Developer & Tech Lead in India`,
  description:
    "Full-stack developer and tech lead in Nashik, India. I build Next.js and Node.js web apps, Razorpay subscriptions and AI automations. Hire me or get a quote.",
  siteName: profile.name,
  keywords: [
    "Kaustubh Chaphekar", "full-stack developer", "tech lead", "Next.js developer", "React developer",
    "Node.js developer", "TypeScript", "freelance web developer India", "web developer Nashik",
    "Razorpay integration", "SaaS developer", "GCP Pub/Sub", "AI agent developer", "three.js portfolio",
  ],
};

// Stable IDs let the separate JSON-LD blocks on each page refer to the same entities.
const ids = {
  website: `${productionUrl}/#website`,
  person: `${productionUrl}/#person`,
  wallxy: `${productionUrl}/#wallxy`,
};

const person = {
  "@type": "Person",
  "@id": ids.person,
  name: profile.name,
  givenName: profile.firstName,
  familyName: profile.lastName,
  jobTitle: profile.role,
  description: profile.summary,
  url: productionUrl,
  email: `mailto:${profile.email}`,
  sameAs: [profile.linkedin, profile.github],
  address: { "@type": "PostalAddress", addressLocality: "Nashik", addressRegion: "Maharashtra", addressCountry: "IN" },
  worksFor: { "@type": "Organization", "@id": ids.wallxy, name: experience.company, url: experience.url },
  alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
  knowsAbout: skills.flatMap((g) => g.items),
  knowsLanguage: ["English", "Marathi"],
  // Freelance services, so searches like "Next.js developer India" can match.
  makesOffer: services.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.title, description: s.body, areaServed: "Worldwide", provider: { "@id": ids.person } },
  })),
};

const website = {
  "@type": "WebSite",
  "@id": ids.website,
  url: productionUrl,
  // Google shows this as the site name above your search result.
  name: profile.name,
  alternateName: ["Kaustubh.dev", "Kaustubh Chaphekar Portfolio"],
  inLanguage: "en-IN",
  publisher: { "@id": ids.person },
};

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      website,
      person,
      {
        "@type": "ProfilePage",
        "@id": `${productionUrl}/#profile`,
        url: siteUrl,
        name: seo.title,
        isPartOf: { "@id": ids.website },
        mainEntity: { "@id": ids.person },
        dateModified: new Date().toISOString(),
        hasPart: {
          "@type": "SoftwareSourceCode",
          name: aiAgent.name,
          description: aiAgent.headline,
          programmingLanguage: ["TypeScript", "JavaScript"],
          author: { "@id": ids.person },
        },
      },
    ],
  };
}

export function caseStudyJsonLd(study: CaseStudy) {
  const url = `${productionUrl}/work/${study.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      website,
      person,
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: `${study.title}: case study`,
        description: study.subtitle,
        url,
        mainEntityOfPage: url,
        image: `${url}/opengraph-image`,
        datePublished: study.published,
        dateModified: study.updated ?? study.published,
        author: { "@id": ids.person },
        publisher: { "@id": ids.person },
        isPartOf: { "@id": ids.website },
        about: study.stack,
        keywords: study.stack.join(", "),
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: productionUrl },
          { "@type": "ListItem", position: 2, name: "Work", item: `${productionUrl}/#projects` },
          { "@type": "ListItem", position: 3, name: study.title, item: url },
        ],
      },
    ],
  };
}

// Serialise JSON-LD safely for a <script> tag.
export const ldScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
