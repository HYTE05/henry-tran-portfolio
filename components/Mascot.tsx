"use client";

import { useEffect, useState } from "react";

import { useMascotContext } from "@/contexts/MascotContext";
import { useScrollSection } from "@/hooks/useScrollSection";
import {
  MASCOT_SPRITE_PATH,
  mascotBackgroundPosition,
} from "@/lib/mascot/spriteConfig";
import type { MascotAnim } from "@/lib/mascot/types";

export type { MascotAnim };

function resolveAnim(
  section: ReturnType<typeof useScrollSection>,
  exploreHovered: boolean,
): MascotAnim {
  if (section === "projects") return "excited";
  if (section === "build") return "typing";
  if (section === "explore") return exploreHovered ? "excited" : "point";
  if (section === "about") return "wave";
  return "idle";
}

function useSpritesheetAvailable(src: string) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setOk(true);
    };
    img.onerror = () => {
      if (!cancelled) setOk(false);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return ok;
}

/**
 * Phase 3: optional `/mascot/spritesheet.png` (5×1 strip) — see `public/mascot/README.txt`.
 * Until then, dashed placeholder + live anim label for debugging.
 */
export function Mascot() {
  const section = useScrollSection();
  const { exploreHovered } = useMascotContext();
  const anim = resolveAnim(section, exploreHovered);
  const hasSheet = useSpritesheetAvailable(MASCOT_SPRITE_PATH);

  return (
    <div
      data-mascot-section={section}
      data-mascot-anim={anim}
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex h-24 w-24 flex-col items-center justify-center gap-1 overflow-hidden"
      style={
        hasSheet
          ? {
              backgroundImage: `url(${MASCOT_SPRITE_PATH})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "500% 100%",
              backgroundPosition: mascotBackgroundPosition(anim),
              transition: "background-position 0.35s ease",
            }
          : {
              border: "2px dashed red",
              color: "red",
            }
      }
      aria-hidden
    >
      {!hasSheet ? (
        <>
          <span className="text-[0.65rem] font-bold tracking-[0.1em]">
            MASCOT
          </span>
          <span className="font-[family-name:var(--font-dm-sans)] text-[0.5rem] font-normal normal-case tracking-normal opacity-70">
            {anim}
          </span>
        </>
      ) : null}
    </div>
  );
}
