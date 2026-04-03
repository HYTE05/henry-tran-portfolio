import type { Vector2 } from "./types";

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Rasterize `text` in a script face on an offscreen canvas and return up to
 * `maxPoints` normalized XY samples in [0,1] (canvas space, origin top-left).
 */
export async function sampleScriptLetterTargets(
  text: string,
  cssFontStack: string,
  maxPoints: number,
): Promise<Vector2[]> {
  await document.fonts.load(`300px ${cssFontStack}`);

  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1);
  const w = 1400 * dpr;
  const h = 420 * dpr;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${280 * dpr}px ${cssFontStack}`;
  ctx.fillText(text, w / 2, h / 2);

  const { data } = ctx.getImageData(0, 0, w, h);
  const candidates: Vector2[] = [];
  const step = Math.max(2, Math.floor(3 * dpr));

  for (let y = 0; y < h; y += step) {
    const row = y * w;
    for (let x = 0; x < w; x += step) {
      const a = data[(row + x) * 4 + 3];
      if (a > 140) {
        candidates.push({ x: x / w, y: y / h });
      }
    }
  }

  shuffleInPlace(candidates);

  if (candidates.length <= maxPoints) {
    return candidates;
  }

  const stride = Math.ceil(candidates.length / maxPoints);
  const out: Vector2[] = [];
  for (let i = 0; i < candidates.length && out.length < maxPoints; i += stride) {
    out.push(candidates[i]!);
  }
  while (out.length < maxPoints && candidates.length > 0) {
    out.push(candidates[out.length % candidates.length]!);
  }
  return out.slice(0, maxPoints);
}

/** Map normalized glyph samples to screen pixels centered in the viewport. */
export function mapTargetsToScreen(
  normalized: Vector2[],
  width: number,
  height: number,
): Float32Array {
  const scale = Math.min(width, height) * 0.42;
  const cx = width * 0.5;
  const cy = height * 0.38;
  const out = new Float32Array(normalized.length * 2);
  let j = 0;
  for (const p of normalized) {
    const nx = (p.x - 0.5) * 1.15;
    const ny = p.y - 0.5;
    out[j++] = cx + nx * scale;
    out[j++] = cy + ny * scale;
  }
  return out;
}
