import type { Metadata } from "next";

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
        {children}

        {/* MASCOT placeholder — fixed bottom-right corner */}
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            width: "96px",
            height: "96px",
            border: "2px dashed red",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "red",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          MASCOT
        </div>
      </body>
    </html>
  );
}
