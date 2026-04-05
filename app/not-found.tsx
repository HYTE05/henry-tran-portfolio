import Link from "next/link";

/**
 * 404 — "Lost in orbit."
 *
 * PRD spec:
 * - Full dark background #08090d, everything centered
 * - Large heading "Lost in orbit." — Cormorant Garamond, clamp(4rem,8vw,7rem), weight 300, #f0ece4
 * - Subtext "This flight path doesn't exist." — DM Sans, 1rem, #8a8680
 * - Small SVG plane drifting slowly left to right, looping — subtle, not distracting
 * - "Return to base" button — amber filled CTA, links to /
 */
export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-[var(--bg-primary)] px-6"
    >
      {/* Drifting plane animation — fixed position, slow left-to-right loop */}
      <style>{`
        @keyframes plane-drift-404 {
          0%   { transform: translateX(-120px); opacity: 0; }
          8%   { opacity: 0.18; }
          92%  { opacity: 0.18; }
          100% { transform: translateX(calc(100vw + 120px)); opacity: 0; }
        }
        .plane-drift-404 {
          position: fixed;
          top: 20%;
          left: 0;
          pointer-events: none;
          animation: plane-drift-404 24s linear infinite;
          z-index: 1;
        }
      `}</style>

      <div className="plane-drift-404" aria-hidden>
        <svg
          width="56"
          height="32"
          viewBox="0 0 72 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M4 20 38 10l8-6 6 2-4 8 14 6v4L44 26l-6 8-6-2-18-8-10 12H6l2-16Z"
            fill="var(--text-primary)"
            fillOpacity={0.55}
          />
          <path
            d="m38 10 10-2"
            stroke="var(--text-secondary)"
            strokeWidth="1.2"
          />
          <circle cx="52" cy="12" r="2" fill="var(--accent-cool)" fillOpacity={0.7} />
        </svg>
      </div>

      <div className="relative z-10 max-w-md text-center">
        <h1
          className="font-[family-name:var(--font-cormorant)] text-[var(--text-primary)]"
          style={{
            fontSize: "clamp(4rem, 8vw, 7rem)",
            fontWeight: 300,
            lineHeight: 1.05,
          }}
        >
          Lost in orbit.
        </h1>

        <p
          className="font-[family-name:var(--font-dm-sans)] mt-5 text-[var(--text-secondary)]"
          style={{ fontSize: "1rem" }}
        >
          This flight path doesn&apos;t exist.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="font-[family-name:var(--font-dm-sans)] inline-flex items-center bg-[var(--accent-warm)] px-7 py-3 text-sm font-medium tracking-wide text-[var(--bg-primary)] transition-all duration-200 hover:opacity-90"
          >
            Return to base
          </Link>
        </div>
      </div>
    </main>
  );
}
