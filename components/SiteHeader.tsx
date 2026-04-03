"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("post-hero-sentinel");
    if (!sentinel) {
      const id = window.requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => cancelAnimationFrame(id);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { root: null, rootMargin: "0px", threshold: 0.001 },
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-4 transition-opacity duration-500"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden={!visible}
    >
      <Link
        href="/"
        className="font-[family-name:var(--font-cormorant)] text-lg tracking-[0.12em] text-[var(--text-primary)] transition-colors hover:text-[var(--accent-warm)] md:text-xl"
      >
        Henry Tran
      </Link>
      <nav className="flex gap-8 text-sm font-[family-name:var(--font-dm-sans)] tracking-wide text-[var(--text-secondary)]">
        <Link
          href="/projects"
          className="transition-colors hover:text-[var(--text-primary)]"
        >
          Projects
        </Link>
      </nav>
    </header>
  );
}
