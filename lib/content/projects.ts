export type ProjectEntry = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  /** External demo or repo; use # for placeholders */
  href: string;
  featured?: boolean;
};

export const PROJECTS: ProjectEntry[] = [
  {
    slug: "aerovoyage",
    title: "AeroVoyage",
    description:
      "An interactive path through lift, drag, and flow — built so you can see how the physics connect, not only read about them.",
    tags: [
      "TypeScript",
      "Next.js",
      "Teaching",
      "Aerodynamics",
      "Simulation",
    ],
    href: "#",
    featured: true,
  },
  {
    slug: "portfolio",
    title: "This portfolio",
    description:
      "Opening flyby sequence, scroll-driven sections, and lightweight 3D wireframe accents — tuned for clarity over spectacle.",
    tags: ["Next.js", "GSAP", "Three.js", "Design system"],
    href: "#",
  },
  {
    slug: "course-tools",
    title: "Aero coursework utilities",
    description:
      "Small Python and MATLAB helpers for homework and lab reports — dimensional checks, quick plots, and sanity scripts.",
    tags: ["Python", "MATLAB", "Aerospace"],
    href: "#",
  },
];

export const FEATURED_PROJECT =
  PROJECTS.find((p) => p.featured) ?? PROJECTS[0]!;
