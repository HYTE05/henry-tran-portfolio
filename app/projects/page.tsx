"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

import { FEATURED_PROJECT, PROJECTS } from "@/lib/content/projects";

const ExplodedView = dynamic(
  () => import("@/components/projects/ExplodedView").then((m) => ({ default: m.ExplodedView })),
  { ssr: false }
);

export default function ProjectsPage() {
  const others = PROJECTS.filter((p) => p.slug !== FEATURED_PROJECT.slug);
  const [showExplodedView, setShowExplodedView] = useState(false);

  if (showExplodedView) {
    return <ExplodedView onClose={() => setShowExplodedView(false)} />;
  }

  return (
    <main
      id="projects-page-root"
      className="min-h-screen flex-1 bg-[var(--bg-primary)] px-6 py-24 md:py-28"
    >
      <div className="mx-auto max-w-4xl">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          Work
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] mt-3 text-4xl text-[var(--text-primary)] md:text-5xl">
          Projects
        </h1>
        <p className="font-[family-name:var(--font-dm-sans)] mt-4 max-w-2xl text-[var(--text-secondary)] md:text-lg">
          Aerospace tooling, teaching experiments, and interfaces that make
          theory easier to reason about.
        </p>

        <article className="mt-14 overflow-hidden rounded-xl border border-[var(--bg-surface)] bg-[var(--bg-surface)]/40">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0c0e14]">
            <div
              className="projects-preview-sheen absolute inset-0 opacity-90"
              style={{
                background:
                  "linear-gradient(125deg, #12141a 0%, #1a2438 40%, #0f1624 55%, #12141a 100%)",
              }}
            />
            <div className="projects-preview-grid absolute inset-0" />
            <p className="font-[family-name:var(--font-dm-sans)] absolute bottom-4 left-4 text-[0.7rem] uppercase tracking-[0.25em] text-[var(--text-secondary)]">
              {FEATURED_PROJECT.title} — featured
            </p>
          </div>
          <div className="p-8 md:p-10">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--text-primary)] md:text-3xl">
              {FEATURED_PROJECT.title}
            </h2>
            <p className="font-[family-name:var(--font-dm-sans)] mt-4 max-w-2xl text-[var(--text-secondary)] md:text-lg">
              {FEATURED_PROJECT.description}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {FEATURED_PROJECT.tags.map((t) => (
                <li
                  key={t}
                  className="rounded border border-[var(--text-secondary)]/25 px-3 py-1 font-[family-name:var(--font-dm-sans)] text-xs tracking-wide text-[var(--text-secondary)]"
                >
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={FEATURED_PROJECT.href}
                className="font-[family-name:var(--font-dm-sans)] inline-flex border border-[var(--accent-cool)] px-6 py-3 text-sm tracking-wide text-[var(--accent-cool)] transition-colors duration-200 hover:bg-[var(--accent-cool)]/10"
              >
                View Live
              </Link>
              <button
                onClick={() => setShowExplodedView(true)}
                className="font-[family-name:var(--font-dm-sans)] inline-flex border border-[var(--accent-warm)] px-6 py-3 text-sm tracking-wide text-[var(--accent-warm)] transition-colors duration-200 hover:bg-[var(--accent-warm)]/10"
              >
                Explore Architecture
              </button>
            </div>
          </div>
        </article>

        <h2 className="font-[family-name:var(--font-cormorant)] mt-20 mb-8 text-xl tracking-[0.12em] text-[var(--text-secondary)]">
          More
        </h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {others.map((p) => (
            <li key={p.slug}>
              <Link
                href={p.href}
                className="group block h-full rounded-xl border border-[var(--bg-surface)] bg-[var(--bg-surface)]/30 p-6 transition-colors duration-200 hover:border-[var(--text-secondary)]/30 hover:bg-[var(--bg-surface)]/50"
              >
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-warm)]">
                  {p.title}
                </h3>
                <p className="font-[family-name:var(--font-dm-sans)] mt-3 text-sm text-[var(--text-secondary)]">
                  {p.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.tags.slice(0, 4).map((t) => (
                    <li
                      key={t}
                      className="rounded border border-[var(--text-secondary)]/20 px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[0.65rem] tracking-wide text-[var(--text-secondary)]"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="font-[family-name:var(--font-dm-sans)] mt-16 inline-flex text-sm tracking-wide text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
