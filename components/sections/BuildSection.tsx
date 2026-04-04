"use client";

import dynamic from "next/dynamic";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

import { registerScrollTrigger } from "@/lib/gsap/registerScrollTrigger";

const WireframeFuselage = dynamic(
  () => import("@/components/build/WireframeFuselage"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-72 w-full max-w-lg animate-pulse rounded-lg bg-[var(--bg-surface)]/50 md:h-96"
        aria-hidden
      />
    ),
  },
);

const LINES = [
  "AeroVoyage was built to teach aerodynamics.",
  "AI as a tool, not a crutch.",
  "If you build it, others can find it.",
];

export function BuildSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useLayoutEffect(() => {
    registerScrollTrigger();
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const lines = lineRefs.current.filter(Boolean) as HTMLParagraphElement[];
      gsap.set(lines, { opacity: 0.08, y: 18 });

      lines.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            end: "top 42%",
            scrub: 0.6,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-build"
      data-scroll-section="build"
      className="relative bg-[var(--bg-primary)] py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 px-6 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="max-w-xl md:pt-8">
          <h2 className="font-[family-name:var(--font-cormorant)] mb-10 text-2xl tracking-[0.14em] text-[var(--text-secondary)] md:text-3xl">
            Build
          </h2>
          {LINES.map((text, i) => (
            <p
              key={text}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="font-[family-name:var(--font-dm-sans)] text-lg leading-relaxed text-[var(--text-primary)] md:text-xl [&:not(:last-child)]:mb-8"
            >
              {text}
            </p>
          ))}
        </div>
        <WireframeFuselage />
      </div>
    </section>
  );
}
