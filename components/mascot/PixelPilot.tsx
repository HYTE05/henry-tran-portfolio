/**
 * Temporary pixel-art style SVG pilot mascot.
 * This is an intentional placeholder that matches the portfolio's color palette.
 * When the real spritesheet arrives, this component can be removed and the
 * Mascot.tsx will automatically use the spritesheet background-position logic.
 */

import type { MascotAnim } from "@/lib/mascot/types";

interface PixelPilotProps {
  anim: MascotAnim;
}

export function PixelPilot({ anim }: PixelPilotProps) {
  // Simple pixel-art pilot silhouette in portfolio colors
  // 48x48px grid, using CSS to scale up
  const pilotSVG = (
    <svg
      viewBox="0 0 48 48"
      className="h-full w-full"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Helmet */}
      <rect x="16" y="8" width="16" height="12" fill="var(--accent-cool)" />
      <rect x="14" y="10" width="2" height="8" fill="var(--accent-cool)" />
      <rect x="32" y="10" width="2" height="8" fill="var(--accent-cool)" />

      {/* Visor */}
      <rect x="18" y="10" width="12" height="4" fill="var(--accent-warm)" />

      {/* Flight suit body */}
      <rect x="12" y="20" width="24" height="16" fill="var(--text-secondary)" />

      {/* Arms */}
      <rect x="8" y="22" width="4" height="12" fill="var(--text-secondary)" />
      <rect x="36" y="22" width="4" height="12" fill="var(--text-secondary)" />

      {/* Legs */}
      <rect x="16" y="36" width="4" height="8" fill="var(--text-secondary)" />
      <rect x="28" y="36" width="4" height="8" fill="var(--text-secondary)" />

      {/* Accent stripe on suit */}
      <rect x="12" y="24" width="24" height="2" fill="var(--accent-warm)" />
    </svg>
  );

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      data-mascot-anim={anim}
      style={{
        // Subtle animations for each state
        animation:
          anim === "wave"
            ? "mascot-wave 0.6s ease-in-out infinite"
            : anim === "point"
              ? "mascot-point 0.8s ease-in-out infinite"
              : anim === "excited"
                ? "mascot-bounce 0.5s ease-in-out infinite"
                : anim === "typing"
                  ? "mascot-type 0.4s ease-in-out infinite"
                  : anim === "celebrate"
                    ? "mascot-celebrate 0.6s ease-in-out infinite"
                    : "none",
      }}
    >
      <style>{`
        @keyframes mascot-wave {
          0%, 100% { transform: rotateZ(0deg); }
          25% { transform: rotateZ(-8deg); }
          75% { transform: rotateZ(8deg); }
        }
        @keyframes mascot-point {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes mascot-type {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.95); }
        }
        @keyframes mascot-celebrate {
          0%, 100% { transform: translateY(0) rotateZ(0deg); }
          25% { transform: translateY(-8px) rotateZ(-5deg); }
          75% { transform: translateY(-8px) rotateZ(5deg); }
        }
      `}</style>
      {pilotSVG}
    </div>
  );
}
