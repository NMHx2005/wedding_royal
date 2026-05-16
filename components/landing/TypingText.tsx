"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Một hoặc nhiều câu: gõ xong → nghỉ → gõ câu kế (lặp vòng) */
  texts: string[];
  className?: string;
  /** ms mỗi ký tự */
  speedMs?: number;
  /** Nghỉ sau khi gõ xong một câu, trước khi chuyển câu tiếp */
  pauseAfterFullMs?: number;
};

export function TypingText({
  texts,
  className = "",
  speedMs = 42,
  pauseAfterFullMs = 2600,
}: Props) {
  const lines = texts.filter((t) => t.length > 0);
  const [reduce, setReduce] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);

  const current = lines.length ? lines[lineIdx % lines.length] : "";

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let pauseId: ReturnType<typeof setTimeout> | undefined;

    const clearAll = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
      if (pauseId !== undefined) {
        clearTimeout(pauseId);
        pauseId = undefined;
      }
    };

    if (lines.length === 0 || !current) return;

    if (reduce) {
      setShown(current.length);
      return;
    }

    setShown(0);
    let i = 0;
    intervalId = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= current.length) {
        if (intervalId !== undefined) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
        pauseId = setTimeout(() => {
          setShown(0);
          setLineIdx((k) => (k + 1) % lines.length);
        }, pauseAfterFullMs);
      }
    }, speedMs);

    return clearAll;
  }, [current, lines.length, pauseAfterFullMs, reduce, speedMs]);

  const visible = current.slice(0, shown);
  const done = shown >= current.length;

  return (
    <p className={className} aria-live="polite">
      {visible.split("").map((ch, idx) => (
        <span key={`${lineIdx}-${idx}-${ch}`} className="inline-block animate-[char-pop_0.32s_ease-out_both]">
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
      {!done && (
        <span
          className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-rose-500"
          style={{ verticalAlign: "-0.12em" }}
          aria-hidden
        />
      )}
    </p>
  );
}
