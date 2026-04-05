"use client";

import { useEffect, useRef } from "react";

/**
 * PlaneCursor — custom plane cursor with smoke contrail.
 *
 * PRD spec:
 * - Fixed full-screen canvas, z-index 9999, pointer-events: none
 * - SVG airplane lags behind true cursor with lerp factor 0.10–0.12
 * - Smoke contrail particles spawn at TRUE cursor position every frame
 *   while moving; each particle fades over 600ms, grows 1px → 2.5px
 * - Hover detection on a, button, [role="button"], .hoverable:
 *   trail shifts to amber (#e8a84c), plane scales 1.3x, ring appears
 * - Mobile/touch: do not mount at all
 * - cursor: none applied globally via CSS
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 → 1 (1 = just born, 0 = dead)
  maxLife: number; // seconds
  isHover: boolean;
}

const LERP = 0.11;
const PARTICLE_LIFETIME = 0.6; // seconds
const PARTICLE_SIZE_START = 1.0;
const PARTICLE_SIZE_END = 2.5;
const PARTICLE_OPACITY_START = 0.6;
const PARTICLE_DRIFT = 0.3; // px per frame max drift
const TRAIL_COLOR_NORMAL = "rgba(200,230,245,0.8)";
const TRAIL_COLOR_HOVER = "#e8a84c";
const PLANE_SCALE_NORMAL = 1.0;
const PLANE_SCALE_HOVER = 1.3;
const RING_COLOR = "rgba(232,168,76,0.5)";
const RING_RADIUS = 18;

// Plane SVG path data (same as OpeningHero PlaneSvg, scaled to ~36x20)
function drawPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  scale: number,
  isHover: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  // Ring on hover
  if (isHover) {
    ctx.beginPath();
    ctx.arc(0, 0, RING_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Plane body — scaled down from 72×40 viewBox to ~36×20
  const s = 0.5;
  ctx.scale(s, s);
  ctx.translate(-36, -20);

  ctx.beginPath();
  // Main body path: M4 20 38 10l8-6 6 2-4 8 14 6v4L44 26l-6 8-6-2-18-8-10 12H6l2-16Z
  ctx.moveTo(4, 20);
  ctx.lineTo(38, 10);
  ctx.lineTo(46, 4);
  ctx.lineTo(52, 6);
  ctx.lineTo(48, 14);
  ctx.lineTo(62, 20);
  ctx.lineTo(62, 24);
  ctx.lineTo(44, 26);
  ctx.lineTo(38, 34);
  ctx.lineTo(32, 32);
  ctx.lineTo(14, 24);
  ctx.lineTo(4, 36);
  ctx.lineTo(6, 36);
  ctx.lineTo(8, 20);
  ctx.closePath();

  ctx.fillStyle = isHover ? "#e8a84c" : "rgba(240,236,228,0.92)";
  ctx.fill();

  // Wing tip detail
  ctx.beginPath();
  ctx.moveTo(38, 10);
  ctx.lineTo(48, 8);
  ctx.strokeStyle = "rgba(79,168,213,0.85)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Engine dot
  ctx.beginPath();
  ctx.arc(52, 12, 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(79,168,213,0.85)";
  ctx.fill();

  ctx.restore();
}

export function PlaneCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Touch device detection — don't run on touch
    if (
      typeof navigator !== "undefined" &&
      navigator.maxTouchPoints > 0
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to fill viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // State
    let trueX = -200;
    let trueY = -200;
    let lerpX = -200;
    let lerpY = -200;
    let prevLerpX = -200;
    let prevLerpY = -200;
    let isHover = false;
    let lastTime = performance.now();
    let frameCount = 0;
    const particles: Particle[] = [];
    let rafId: number;

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      trueX = e.clientX;
      trueY = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Hover detection — check every frame against interactive elements
    const getHoverableElements = (): Element[] => {
      return Array.from(
        document.querySelectorAll('a, button, [role="button"], .hoverable'),
      );
    };

    const checkHover = (): boolean => {
      const elements = getHoverableElements();
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (
          trueX >= rect.left &&
          trueX <= rect.right &&
          trueY >= rect.top &&
          trueY <= rect.bottom
        ) {
          return true;
        }
      }
      return false;
    };

    // Animation loop
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
      lastTime = now;
      frameCount++;

      // Lerp plane position
      lerpX += (trueX - lerpX) * LERP;
      lerpY += (trueY - lerpY) * LERP;

      // Hover check (every 2 frames for performance)
      if (frameCount % 2 === 0) {
        isHover = checkHover();
      }

      // Spawn particle at TRUE cursor position
      const moved = Math.hypot(trueX - lerpX, trueY - lerpY) > 0.5;
      const speed = Math.hypot(trueX - prevLerpX, trueY - prevLerpY);
      const spawnRate = speed > 2 ? 1 : speed > 0.5 ? 0.5 : 0;

      if (spawnRate > 0 && Math.random() < spawnRate) {
        particles.push({
          x: trueX,
          y: trueY,
          vx: (Math.random() - 0.5) * PARTICLE_DRIFT * 60,
          vy: (Math.random() - 0.5) * PARTICLE_DRIFT * 60,
          life: 1.0,
          maxLife: PARTICLE_LIFETIME,
          isHover,
        });
      }

      prevLerpX = lerpX;
      prevLerpY = lerpY;

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life -= dt / p.maxLife;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Slight random drift each frame
        p.x += (Math.random() - 0.5) * PARTICLE_DRIFT;
        p.y += (Math.random() - 0.5) * PARTICLE_DRIFT;
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles (below plane)
      for (const p of particles) {
        const t = 1 - p.life; // 0 = just born, 1 = dead
        const opacity = p.life * PARTICLE_OPACITY_START;
        const size = PARTICLE_SIZE_START + t * (PARTICLE_SIZE_END - PARTICLE_SIZE_START);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.isHover
          ? `rgba(232,168,76,${opacity})`
          : `rgba(200,230,245,${opacity})`;
        ctx.fill();
      }

      // Draw plane on top
      if (trueX > -100) {
        // Calculate angle from lerp velocity
        const dx = lerpX - prevLerpX;
        const dy = lerpY - prevLerpY;
        const angle = Math.abs(dx) + Math.abs(dy) > 0.1 ? Math.atan2(dy, dx) : 0;
        const scale = isHover ? PLANE_SCALE_HOVER : PLANE_SCALE_NORMAL;
        drawPlane(ctx, lerpX, lerpY, angle, scale, isHover);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      aria-hidden
    />
  );
}
