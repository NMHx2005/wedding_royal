"use client";

import { useEffect } from "react";

const PX_PER_SECOND = 22;

/**
 * Slowly auto-scrolls the invitation page.
 * Pauses when:
 *  - user scrolls/touches/keys
 *  - music pauses (listens for `invitation:music:pause` / `invitation:music:play`)
 */
export function InvitationAutoScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    let pausedByUser = false;
    let pausedByMusic = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const isPaused = () => pausedByUser || pausedByMusic;

    const pauseByUser = () => {
      pausedByUser = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        pausedByUser = false;
        last = performance.now();
      }, 4000);
    };

    const onMusicPlay = () => {
      pausedByMusic = false;
      last = performance.now();
    };
    const onMusicPause = () => {
      pausedByMusic = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    };

    const onWheel = () => pauseByUser();
    const onTouch = () => pauseByUser();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) {
        pauseByUser();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("invitation:music:play", onMusicPlay);
    window.addEventListener("invitation:music:pause", onMusicPause);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!isPaused()) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 8 && window.scrollY < maxScroll - 1) {
          window.scrollBy({ top: PX_PER_SECOND * dt, behavior: "auto" });
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const startTimer = setTimeout(() => {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }, 1200);

    return () => {
      clearTimeout(startTimer);
      if (resumeTimer) clearTimeout(resumeTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("invitation:music:play", onMusicPlay);
      window.removeEventListener("invitation:music:pause", onMusicPause);
    };
  }, []);

  return null;
}
