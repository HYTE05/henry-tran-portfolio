import type { MascotAnim } from "./types";

/** Drop a 5×1 horizontal strip here (five equal frames). See README in /public/mascot/. */
export const MASCOT_SPRITE_PATH = "/mascot/spritesheet.png";

/** Column order must match the exported PNG left → right. */
export const MASCOT_ANIM_ORDER: MascotAnim[] = [
  "idle",
  "wave",
  "point",
  "excited",
  "typing",
  "celebrate",
];

/** background-position for a 600% × 100% background-size strip (six frames). */
export function mascotBackgroundPosition(anim: MascotAnim): string {
  const i = MASCOT_ANIM_ORDER.indexOf(anim);
  const n = MASCOT_ANIM_ORDER.length;
  const pct = n <= 1 ? 0 : (i / (n - 1)) * 100;
  return `${pct}% 0`;
}
