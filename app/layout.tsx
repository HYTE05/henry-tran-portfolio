import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";
import { SiteHeader } from "@/components/SiteHeader";

import { fontCormorant, fontDmSans, fontGreatVibes } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Henry Tran — Portfolio",
  description: "Personal portfolio of Henry Tran.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontCormorant.variable} ${fontDmSans.variable} ${fontGreatVibes.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col font-[family-name:var(--font-dm-sans)]">
        <SiteHeader />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
