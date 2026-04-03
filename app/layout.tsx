import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
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
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          MASCOT
        </div>
      </body>
    </html>
  );
}
