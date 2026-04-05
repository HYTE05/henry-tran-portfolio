"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";

import { fontGreatVibes } from "@/app/fonts";
import { cubicBezierPoint, cubicBezierTangent, normalize2 } from "@/lib/hero/bezier";
import { FlybyAudio } from "@/lib/hero/audioFlyby";
import { mapTargetsToScreen, sampleScriptLetterTargets } from "@/lib/hero/letterTargets";
import { SmokeParticleEngine } from "@/lib/hero/smokeParticleEngine";
import type { Vector2 } from "@/lib/hero/types";

const PARTICLE_COUNT = 1000;
const FORMATION_TEXT = "HENRY TRAN";

/** Normalized screen space: x,y in [0,1], origin top-left. */
const PASS_CURVES: readonly [Vector2, Vector2, Vector2, Vector2][] = [
  [
    { x: -0.06, y: 0.58 },
    { x: 0.22, y: 0.18 },
    { x: 0.58, y: 0.72 },
    { x: 1.06, y: 0.38 },
  ],
  [
    { x: 1.06, y: 0.64 },
    { x: 0.68, y: 0.22 },
    { x: 0.32, y: 0.78 },
    { x: -0.06, y: 0.44 },
  ],
  [
    { x: -0.06, y: 0.3 },
    { x: 0.28, y: 0.66 },
    { x: 0.62, y: 0.2 },
    { x: 1.06, y: 0.56 },
  ],
  [
    { x: -0.08, y: 0.48 },
    { x: 0.32, y: 0.44 },
    { x: 0.68, y: 0.52 },
    { x: 1.08, y: 0.46 },
  ],
];

function PlaneSvg() {
  return (
    <svg
      width="72"
      height="40"
      viewBox="0 0 72 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="overflow-visible"
    >
      <path
        d="M4 20 38 10l8-6 6 2-4 8 14 6v4L44 26l-6 8-6-2-18-8-10 12H6l2-16Z"
        fill="var(--text-primary)"
        fillOpacity={0.92}
      />
      <path d="m38 10 10-2" stroke="var(--text-secondary)" strokeWidth="1.2" />
      <circle cx="52" cy="12" r="2" fill="var(--accent-cool)" fillOpacity={0.85} />
    </svg>
  );
}

function ScrollIndicator({ visible }: { visible: boolean }) {
  return (
    <div
      className="pointer-events-none absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      <div className={visible ? "scroll-mouse-shell" : ""}>
        <svg
          width="34"
          height="52"
          viewBox="0 0 34 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          className="overflow-visible"
        >
          <title>Scroll down</title>
          <rect
            x="5"
            y="2"
            width="24"
            height="40"
            rx="12"
            stroke="var(--text-secondary)"
            strokeWidth="1.25"
            fill="none"
            opacity={0.92}
          />
          <g
            className={visible ? "scroll-mouse-wheel" : ""}
            style={{
              transformOrigin: "17px 15px",
            }}
          >
            <line
              x1="17"
              y1="12"
              x2="17"
              y2="18"
              stroke="var(--text-primary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function OpeningHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<FlybyAudio | null>(null);
  const engineRef = useRef<SmokeParticleEngine | null>(null);
  const rafRef = useRef<number>(0);
  const lastTRef = useRef<number>(0);
  const phaseRef = useRef<
    "idle" | "playing" | "forming" | "bloom" | "done"
  >("idle");

  const [started, setStarted] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduceMotion(mq.matches);
    queueMicrotask(() => setReduceMotion(mq.matches));
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const disposeEngine = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    engineRef.current?.dispose();
    engineRef.current = null;
  }, []);

  const loopRef = useRef<(t: number) => void>(() => {});

  useEffect(() => {
    loopRef.current = (t: number) => {
      const engine = engineRef.current;
      if (!engine) return;

      const now = t * 0.001;
      const last = lastTRef.current || now;
      const dt = Math.min(0.05, now - last);
      lastTRef.current = now;

      engine.update(dt);
      engine.render();

      const ph = phaseRef.current;
      if (ph === "forming" && engine.attractSettled(2.8)) {
        phaseRef.current = "bloom";
        engine.beginBloom(38 + Math.random() * 12);
      } else if (ph === "bloom" && engine.bloomSettled(1.2)) {
        engine.freezeStatic();
        phaseRef.current = "done";
        window.setTimeout(() => setShowScrollCue(true), 420);
      }

      rafRef.current = requestAnimationFrame((t2) =>
        loopRef.current(typeof t2 === "number" ? t2 : performance.now()),
      );
    };
  }, []);

  useEffect(() => {
    audioRef.current = new FlybyAudio();
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => disposeEngine();
  }, [disposeEngine]);

  const onBegin = async () => {
    if (started) return;
    setStarted(true);
    await audioRef.current?.unlock();

    const host = rootRef.current;
    if (!host || !planeRef.current) return;

    disposeEngine();
    const engine = new SmokeParticleEngine(host, PARTICLE_COUNT);
    engineRef.current = engine;
    lastTRef.current = 0;
    phaseRef.current = "playing";
    rafRef.current = requestAnimationFrame((t2) =>
      loopRef.current(typeof t2 === "number" ? t2 : performance.now()),
    );

    const w = host.clientWidth;
    const h = host.clientHeight;

    const normTargets = await sampleScriptLetterTargets(
      FORMATION_TEXT,
      fontGreatVibes.style.fontFamily,
      PARTICLE_COUNT,
    );
    const screenTargets = mapTargetsToScreen(normTargets, w, h);

    const planeEl = planeRef.current;
    planeEl.style.visibility = "visible";

    const tailOffset = 28;

    const runPass = (
      curve: readonly [Vector2, Vector2, Vector2, Vector2],
      duration: number,
    ) => {
      const prog = { u: 0 };
      let last = performance.now() / 1000;
      return gsap.to(prog, {
        u: 1,
        duration,
        ease: "none",
        onUpdate: () => {
          const now = performance.now() / 1000;
          const dt = Math.min(0.055, Math.max(0.001, now - last));
          last = now;

          const t = prog.u;
          const [p0, p1, p2, p3] = curve;
          const pos = cubicBezierPoint(p0, p1, p2, p3, t);
          const tan = normalize2(cubicBezierTangent(p0, p1, p2, p3, t));

          const px = pos.x * w;
          const py = pos.y * h;
          const vx = -tan.x * w * 0.62 + (Math.random() - 0.5) * 10;
          const vy = -tan.y * h * 0.62 + (Math.random() - 0.5) * 10;

          const tx = tan.x * w;
          const ty = tan.y * h;
          const angleRad = Math.atan2(ty, tx);
          const deg = (angleRad * 180) / Math.PI;

          planeEl.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) rotate(${deg + 8}deg)`;

          const tailX = px - Math.cos(angleRad) * tailOffset;
          const tailY = py - Math.sin(angleRad) * tailOffset;
          const speed = Math.hypot(tx, ty);
          const rate = 0.72 + Math.min(1.35, speed * 0.00028);

          audioRef.current?.setPanFromNormalizedX(px / w - 0.5);
          engine.emitSmoke(tailX, tailY, vx * 0.04, vy * 0.04, rate, dt);
        },
      });
    };

    const playFlyby = (speed01: number) => {
      audioRef.current?.playPass(speed01);
    };

    const tl = gsap.timeline({
      onComplete: () => {
        phaseRef.current = "forming";
        engine.beginFormation(screenTargets);
      },
    });
    if (reduceMotion) tl.timeScale(2.4);

    tl.call(() => playFlyby(0.55))
      .add(runPass(PASS_CURVES[0]!, 2.55))
      .to({}, { duration: 0.28 })
      .call(() => playFlyby(0.62))
      .add(runPass(PASS_CURVES[1]!, 2.55))
      .to({}, { duration: 0.28 })
      .call(() => playFlyby(0.58))
      .add(runPass(PASS_CURVES[2]!, 2.65))
      .to({}, { duration: 0.28 })
      .call(() => playFlyby(0.72))
      .add(runPass(PASS_CURVES[3]!, 3.15));
  };

  return (
    <section
      ref={rootRef}
      data-scroll-section="hero"
      className="relative min-h-[100dvh] w-full overflow-hidden bg-[var(--bg-primary)]"
      aria-label="Opening"
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <p
          className="font-[family-name:var(--font-cormorant)] text-[0.7rem] font-light tracking-[0.55em] text-[var(--text-secondary)] md:text-[0.75rem]"
          style={{ fontWeight: 300 }}
        >
          produced by
        </p>
      </div>

      {!started && (
        <button
          type="button"
          onClick={onBegin}
          className="font-[family-name:var(--font-dm-sans)] absolute inset-0 z-30 cursor-pointer bg-transparent text-center text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-secondary)] opacity-90 transition-opacity hover:opacity-100"
          style={{ paddingTop: "42%" }}
        >
          Click or tap anywhere to begin
        </button>
      )}

      <div
        ref={planeRef}
        className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
        style={{ visibility: "hidden" }}
      >
        <PlaneSvg />
      </div>

      <ScrollIndicator visible={showScrollCue} />
    </section>
  );
}
