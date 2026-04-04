import { OpeningHero } from "@/components/hero/OpeningHero";
import { AboutSection } from "@/components/sections/AboutSection";
import { BuildSection } from "@/components/sections/BuildSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExploreSection } from "@/components/sections/ExploreSection";
import { ProjectsPreviewSection } from "@/components/sections/ProjectsPreviewSection";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <OpeningHero />
      <div
        id="post-hero-sentinel"
        className="pointer-events-none h-px w-full shrink-0 scroll-mt-0"
        aria-hidden
      />
      <AboutSection />
      <ExploreSection />
      <BuildSection />
      <ProjectsPreviewSection />
      <ContactSection />
      <div className="min-h-[10vh] shrink-0" aria-hidden />
    </main>
  );
}
