import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Henry Tran",
  description:
    "Aerospace and software projects — AeroVoyage, coursework tooling, and this portfolio.",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
