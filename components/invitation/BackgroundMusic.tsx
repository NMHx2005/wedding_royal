"use client";

import { useCallback, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Props = {
  src: string | null | undefined;
};

export function BackgroundMusic({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  const unlock = useCallback(async () => {
    setUnlocked(true);
    const el = audioRef.current;
    if (!el || !src) return;
    el.muted = false;
    try {
      el.volume = 0.6;
      await el.play();
    } catch {
      /* autoplay blocked until gesture */
    }
  }, [src]);

  if (!src) return null;

  return (
    <>
      {!unlocked && (
        <button
          type="button"
          onClick={unlock}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6 text-center text-white"
        >
          <span className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium backdrop-blur">
            Nhấn để mở thiệp
          </span>
        </button>
      )}
      <audio ref={audioRef} src={src} loop preload="none" muted={muted} />
      {unlocked && (
        <button
          type="button"
          onClick={() => {
            setMuted((m) => {
              const next = !m;
              const el = audioRef.current;
              if (el) {
                el.muted = next;
                if (!next) void el.play();
              }
              return next;
            });
          }}
          className="fixed bottom-4 right-4 z-[90] flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white shadow-lg"
          aria-label={muted ? "Bật nhạc" : "Tắt nhạc"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </>
  );
}
