"use client";

import gsap from "gsap";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { EXPLORE_SILHOUETTES } from "@/components/silhouettes";
import { useMascotContext } from "@/contexts/MascotContext";
import { registerScrollTrigger } from "@/lib/gsap/registerScrollTrigger";

const DEPTHS = [0.35, 0.55, 0.25, 0.45, 0.3, 0.5, 0.4, 0.38];

export function ExploreSection() {
  const { setExploreHovered } = useMascotContext();
  const sectionRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    registerScrollTrigger();
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: 40 + i * 12 },
          {
            y: -60 - i * 18,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.45 + DEPTHS[i] * 1.2,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const onMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouse({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  }, []);

  const leaveExplore = useCallback(() => {
    setExploreHovered(false);
    setMouse({ x: 0, y: 0 });
  }, [setExploreHovered]);

  return (
    <section
      ref={sectionRef}
      id="section-explore"
      data-scroll-section="explore"
      className="relative min-h-[130dvh] bg-[var(--bg-primary)] py-20"
      onMouseMove={onMove}
      onMouseLeave={leaveExplore}
    >
      <div className="relative mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-cormorant)] mb-16 text-center text-2xl tracking-[0.12em] text-[var(--text-secondary)] md:text-3xl">
          Explore
        </h2>
        <div className="relative min-h-[85vh]">
          {EXPLORE_SILHOUETTES.map((item, i) => {
            const depth = DEPTHS[i] ?? 0.4;
            const col = i % 2;
            const row = Math.floor(i / 2);
            const mx = mouse.x * depth * 36;
            const my = mouse.y * depth * 28;
            return (
              <div
                key={item.id}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                className="group absolute w-[min(42vw,280px)] cursor-default transition-transform duration-100 ease-out md:w-[min(38vw,320px)]"
                style={{
                  left: `${8 + col * 46}%`,
                  top: `${12 + row * 22}%`,
                  transform: `translate(${mx}px, ${my}px)`,
                  zIndex: Math.round(depth * 10),
                }}
                onMouseEnter={() => setExploreHovered(true)}
                onFocus={() => setExploreHovered(true)}
                onBlur={() => setExploreHovered(false)}
              >
                <div className="relative transition-[color,filter] duration-200 ease-out group-hover:brightness-[1.35] group-hover:text-[var(--text-secondary)]">
                  <item.Component className="h-auto w-full text-[#1a1d26]" />
                  <span className="font-[family-name:var(--font-dm-sans)] pointer-events-none absolute -bottom-7 left-1/2 line-clamp-2 w-max max-w-[12rem] -translate-x-1/2 text-center text-[0.65rem] tracking-wide text-[var(--text-secondary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:text-xs">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
