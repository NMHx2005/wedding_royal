"use client";

import { useEffect, useState } from "react";

type Props = {
  targetDate: Date;
  /** When wedding passed and VIP — show "Đã cưới được X ngày" */
  showMarriedDays?: boolean;
};

const EMPTY = { d: 0, h: 0, m: 0, s: 0, past: false, marriedDays: 0 };

export function CountdownTimer({ targetDate, showMarriedDays }: Props) {
  const [parts, setParts] = useState(EMPTY);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const target = targetDate.getTime();
      const diff = target - now;
      if (diff <= 0) {
        const marriedDays = Math.floor((now - target) / (1000 * 60 * 60 * 24));
        setParts({ d: 0, h: 0, m: 0, s: 0, past: true, marriedDays });
        return;
      }
      setParts({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
        past: false,
        marriedDays: 0,
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (parts.past) {
    if (showMarriedDays && parts.marriedDays > 0) {
      return (
        <p className="text-center text-lg font-medium text-neutral-700">
          Đã cưới được <span className="text-mewedding-rose">{parts.marriedDays}</span> ngày
        </p>
      );
    }
    return (
      <p className="text-center text-lg font-medium text-neutral-700">Hôm nay là ngày trọng đại!</p>
    );
  }

  const { d, h, m, s } = parts;

  return (
    <p className="text-center font-mono text-xl tracking-wide text-neutral-800 sm:text-2xl">
      <span className="font-semibold text-mewedding-rose">{String(d).padStart(2, "0")}</span> ngày{" "}
      <span className="font-semibold">{String(h).padStart(2, "0")}</span>:
      <span className="font-semibold">{String(m).padStart(2, "0")}</span>:
      <span className="font-semibold">{String(s).padStart(2, "0")}</span>
    </p>
  );
}
