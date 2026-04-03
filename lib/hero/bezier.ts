import type { Vector2 } from "./types";

/** Cubic Bézier Q(t) for t in [0,1], standard definition. */
export function cubicBezierPoint(
  p0: Vector2,
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  t: number,
): Vector2 {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

/** First derivative; use for tangent / plane heading. */
export function cubicBezierTangent(
  p0: Vector2,
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  t: number,
): Vector2 {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  return {
    x:
      3 * uu * (p1.x - p0.x) +
      6 * u * t * (p2.x - p1.x) +
      3 * tt * (p3.x - p2.x),
    y:
      3 * uu * (p1.y - p0.y) +
      6 * u * t * (p2.y - p1.y) +
      3 * tt * (p3.y - p2.y),
  };
}

export function normalize2(v: Vector2): Vector2 {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}
