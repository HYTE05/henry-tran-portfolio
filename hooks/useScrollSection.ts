"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type ScrollSectionId =
  | "hero"
  | "about"
  | "explore"
  | "build"
  | "projects";

const ORDER: ScrollSectionId[] = [
  "hero",
  "about",
  "explore",
  "build",
  "projects",
];

/** Which major section occupies the middle of the viewport. */
export function useScrollSection(): ScrollSectionId {
  const pathname = usePathname();
  const [fromScroll, setFromScroll] = useState<ScrollSectionId | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setFromScroll(null);
    });
  }, [pathname]);

  useEffect(() => {
    const els: { id: ScrollSectionId; el: Element }[] = [];

    const hero = document.querySelector('[data-scroll-section="hero"]');
    if (hero) els.push({ id: "hero", el: hero });

    for (const id of ORDER) {
      if (id === "hero") continue;
      const el = document.getElementById(`section-${id}`);
      if (el) els.push({ id, el });
    }

    if (pathname === "/projects") {
      const root = document.getElementById("projects-page-root");
      if (root && !els.some((e) => e.id === "projects")) {
        els.push({ id: "projects", el: root });
      }
    }

    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio > 0.12)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target;
        if (!top) return;
        const match = els.find((x) => x.el === top);
        if (match)
          queueMicrotask(() => {
            setFromScroll(match.id);
          });
      },
      {
        root: null,
        rootMargin: "-42% 0px -42% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const { el } of els) io.observe(el);

    return () => io.disconnect();
  }, [pathname]);

  const fallback: ScrollSectionId =
    pathname === "/projects" ? "projects" : "hero";
  return fromScroll ?? fallback;
}
