import About from "@/components/sections/About";
import AiAgent from "@/components/sections/AiAgent";
import Background from "@/components/sections/Background";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import OffScreen from "@/components/sections/OffScreen";
import Projects from "@/components/sections/Projects";
import Services from "@/components/sections/Services";
import Skills from "@/components/sections/Skills";
import { HeroBackdrop } from "@/components/three/Backdrops";
import { aiAgent, education, experience, profile, skills } from "@/lib/data";
import { siteUrl } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: siteUrl,
  mainEntity: {
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    url: siteUrl,
    sameAs: [profile.linkedin, profile.github],
    address: { "@type": "PostalAddress", addressLocality: "Nashik", addressRegion: "Maharashtra", addressCountry: "IN" },
    worksFor: { "@type": "Organization", name: experience.company },
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
    knowsAbout: skills.flatMap((g) => g.items),
    knowsLanguage: ["English", "Marathi"],
  },
  hasPart: {
    "@type": "SoftwareSourceCode",
    name: aiAgent.name,
    description: aiAgent.headline,
    programmingLanguage: ["TypeScript", "JavaScript"],
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HeroBackdrop />
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <main>
        <Hero />
        <Marquee />
        <About />
        <Experience />
        <AiAgent />
        <Projects />
        <Skills />
        <Background />
        <OffScreen />
        <Services />
        <Contact />
      </main>
    </>
  );
}
