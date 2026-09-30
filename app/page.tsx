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
import { homeJsonLd, ldScript } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(homeJsonLd()) }} />
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
