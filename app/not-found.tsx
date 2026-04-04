import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex-1 bg-[var(--bg-primary)] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--bg-surface)] border border-[var(--accent-warm)]/30">
            <span className="font-[family-name:var(--font-cormorant)] text-4xl text-[var(--accent-warm)]">
              404
            </span>
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[var(--text-primary)] mb-3">
          Lost in orbit.
        </h1>

        <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] mb-8">
          The page you&apos;re looking for has drifted beyond the event horizon.
          Let&apos;s get you back on course.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="font-[family-name:var(--font-dm-sans)] px-6 py-3 bg-[var(--accent-cool)] text-[var(--bg-primary)] font-bold rounded transition-colors hover:bg-[var(--accent-cool)]/90"
          >
            Return home
          </Link>
          <Link
            href="/projects"
            className="font-[family-name:var(--font-dm-sans)] px-6 py-3 border border-[var(--accent-warm)] text-[var(--accent-warm)] rounded transition-colors hover:bg-[var(--accent-warm)]/10"
          >
            View projects
          </Link>
        </div>

        {/* Subtle animation */}
        <style>{`
          @keyframes drift {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .drift {
            animation: drift 3s ease-in-out infinite;
          }
        `}</style>
        <div className="mt-12 drift">
          <svg
            viewBox="0 0 100 100"
            className="w-16 h-16 mx-auto opacity-20"
            style={{ imageRendering: "pixelated" }}
          >
            {/* Simple satellite/spacecraft silhouette */}
            <rect x="40" y="30" width="20" height="40" fill="currentColor" />
            <rect x="30" y="40" width="40" height="8" fill="currentColor" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </svg>
        </div>
      </div>
    </main>
  );
}
