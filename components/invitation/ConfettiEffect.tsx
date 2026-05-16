"use client";

import { useEffect, useRef } from "react";
import type { ConfettiEffect as ConfettiType } from "@/types";

type Props = {
  type: ConfettiType;
};

const COLORS: Record<string, string[]> = {
  hearts: ["#e879a9", "#f4c2c2", "#b5606e"],
  snow: ["#ffffff", "#e0f2fe", "#bae6fd"],
  petals: ["#fbcfe8", "#fce7f3", "#fda4af"],
};

export function ConfettiEffect({ type }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type === "none") return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const particles: {
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      c: string;
      rot: number;
      vr: number;
    }[] = [];

    const colors = COLORS[type] ?? COLORS.hearts;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 4 + Math.random() * 8,
          vy: 0.3 + Math.random() * 1.2,
          vx: (Math.random() - 0.5) * 0.6,
          c: colors[i % colors.length] ?? "#f472b6",
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.08,
        });
      }
    };

    resize();
    initParticles();

    let tickCount = 0;
    let raf = 0;

    const tick = () => {
      tickCount += 1;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(tickCount / 40 + p.r) * 0.3;
        p.rot += p.vr;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (type === "hearts") {
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          const s = p.r / 8;
          ctx.moveTo(0, 3 * s);
          ctx.bezierCurveTo(-6 * s, -4 * s, -10 * s, 4 * s, 0, 10 * s);
          ctx.bezierCurveTo(10 * s, 4 * s, 6 * s, -4 * s, 0, 3 * s);
          ctx.fill();
        } else {
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 0.6, p.r * 0.35, p.rot, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      resize();
      initParticles();
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [type]);

  if (type === "none") return null;
  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[5] h-full w-full"
      aria-hidden
    />
  );
}
