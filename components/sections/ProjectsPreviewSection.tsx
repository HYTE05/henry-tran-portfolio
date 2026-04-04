"use client";

import Link from "next/link";

import { FEATURED_PROJECT } from "@/lib/content/projects";

export function ProjectsPreviewSection() {
  return (
    <section
      id="section-projects"
      data-scroll-section="projects"
      className="bg-[var(--bg-primary)] px-6 py-28"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="font-[family-name:var(--font-cormorant)] mb-12 text-center text-2xl tracking-[0.14em] text-[var(--text-secondary)] md:text-3xl">
          Projects
        </h2>

        <article className="overflow-hidden rounded-xl border border-[var(--bg-surface)] bg-[var(--bg-surface)]/40">
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
              {FEATURED_PROJECT.title} — preview
            </p>
          </div>
          <div className="p-8 md:p-10">
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--text-primary)] md:text-3xl">
              {FEATURED_PROJECT.title}
            </h3>
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
            <Link
              href="/projects"
              className="font-[family-name:var(--font-dm-sans)] mt-8 inline-flex border border-[var(--accent-warm)] px-6 py-3 text-sm tracking-wide text-[var(--accent-warm)] transition-colors duration-200 hover:bg-[var(--accent-warm)]/10"
            >
              See all projects
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
