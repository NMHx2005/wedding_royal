"use client";

import { useEffect, useState } from "react";

type Props = {
  targetDate: Date;
  /** When wedding passed and VIP — show "Đã cưới được X ngày" */
  showMarriedDays?: boolean;
};

export function CountdownTimer({ targetDate, showMarriedDays }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = targetDate.getTime();
  const diff = target - now;

  if (diff <= 0) {
    const days = Math.floor((now - target) / (1000 * 60 * 60 * 24));
    if (showMarriedDays && days > 0) {
      return (
        <p className="text-center text-lg font-medium text-neutral-700">
          Đã cưới được <span className="text-mewedding-rose">{days}</span> ngày
        </p>
      );
    }
    return (
      <p className="text-center text-lg font-medium text-neutral-700">Hôm nay là ngày trọng đại!</p>
    );
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return (
    <p className="text-center font-mono text-xl tracking-wide text-neutral-800 sm:text-2xl">
      <span className="font-semibold text-mewedding-rose">{String(d).padStart(2, "0")}</span> ngày{" "}
      <span className="font-semibold">{String(h).padStart(2, "0")}</span>:
      <span className="font-semibold">{String(m).padStart(2, "0")}</span>:
      <span className="font-semibold">{String(s).padStart(2, "0")}</span>
    </p>
  );
}
