"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

import { F22Raptor, NarrowBodyJet, SR71Blackbird } from "@/components/silhouettes";
import { registerScrollTrigger } from "@/lib/gsap/registerScrollTrigger";

const PHRASES = [
  "Purdue University aerospace engineering student",
  "Propulsion. Systems. Physics.",
  "How aircraft and rockets actually work — from the inside.",
  "Python · MATLAB · C++ · JavaScript/TypeScript",
  "Building AI-assisted tools to understand the field.",
];

/**
 * PRD typography tiers:
 * Primary (index 0, 2): clamp(2.5rem, 5vw, 5rem), weight 400–500, #f0ece4
 * Secondary (index 1, 3, 4): clamp(1.5rem, 3vw, 3rem), weight 300, #8a8680
 * Between phrases: thin horizontal rule rgba(240,236,228,0.1)
 */
const isPrimary = (i: number) => i === 0 || i === 2;

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const phraseEls = useRef<(HTMLDivElement | null)[]>([]);
  const driftA = useRef<HTMLDivElement>(null);
  const driftB = useRef<HTMLDivElement>(null);
  const driftC = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    registerScrollTrigger();
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const phrases = phraseEls.current.filter(Boolean) as HTMLDivElement[];
      gsap.set(phrases, { opacity: 0, y: 22 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: "+=340%",
          scrub: 0.65,
          anticipatePin: 1,
        },
      });

      phrases.forEach((el, i) => {
        tl.to(el, { opacity: 1, y: 0, duration: 1, ease: "none" }, i * 0.88);
      });

      const drifters = [driftA.current, driftB.current, driftC.current].filter(
        Boolean,
      ) as HTMLDivElement[];

      drifters.forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: i % 2 === 0 ? "-8%" : "6%", y: i * 6 },
          {
            x: i % 2 === 0 ? "6%" : "-5%",
            y: -i * 10,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.95 + i * 0.22,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-about"
      data-scroll-section="about"
      className="relative bg-[var(--bg-primary)]"
    >
      <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-24">
        <div
          className="pointer-events-none absolute inset-0 text-[var(--bg-surface)]"
          aria-hidden
        >
          <div
            ref={driftA}
            className="absolute -left-[8%] top-[12%] w-[min(52vw,420px)] opacity-[0.22]"
          >
            <SR71Blackbird className="h-auto w-full" />
          </div>
          <div
            ref={driftB}
            className="absolute bottom-[8%] right-[-6%] w-[min(40vw,320px)] opacity-[0.16]"
          >
            <F22Raptor className="h-auto w-full" />
          </div>
          <div
            ref={driftC}
            className="absolute left-[20%] top-[48%] w-[min(36vw,280px)] opacity-[0.12]"
          >
            <NarrowBodyJet className="h-auto w-full" />
          </div>
        </div>

        <div className="relative z-10 max-w-xl text-center md:max-w-2xl">
          {PHRASES.map((text, i) => (
            <div
              key={text}
              ref={(el) => {
                phraseEls.current[i] = el;
              }}
            >
              {/* Thin horizontal rule before each phrase except the first */}
              {i > 0 && (
                <hr
                  className="mx-auto mb-8 w-16 border-none"
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(240,236,228,0.1)",
                  }}
                  aria-hidden
                />
              )}
              <p
                className="font-[family-name:var(--font-cormorant)] leading-snug"
                style={
                  isPrimary(i)
                    ? {
                        fontSize: "clamp(2.5rem, 5vw, 5rem)",
                        fontWeight: 450,
                        color: "var(--text-primary)",
                        marginBottom: i < PHRASES.length - 1 ? "2rem" : 0,
                      }
                    : {
                        fontSize: "clamp(1.5rem, 3vw, 3rem)",
                        fontWeight: 300,
                        color: "var(--text-secondary)",
                        marginBottom: i < PHRASES.length - 1 ? "2rem" : 0,
                      }
                }
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
