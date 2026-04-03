import { OpeningHero } from "@/components/hero/OpeningHero";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <OpeningHero />
      <div
        id="post-hero-sentinel"
        className="pointer-events-none h-px w-full shrink-0 scroll-mt-0"
        aria-hidden
      />
      <div className="min-h-[40vh] shrink-0" aria-hidden />
    </main>
  );
}
