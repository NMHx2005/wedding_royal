"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Easing mượt, “dịu” — out mềm */
export const gentleEase = [0.22, 1, 0.36, 1] as const;
export const gentleDuration = 0.55;

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  as?: "section" | "div";
  /** Dịch nhẹ theo trục Y khi vào viewport */
  y?: number;
};

/** Cuộn vào viewport: chỉ dịch Y — không dùng opacity:0 (tránh trang trắng nếu whileInView/IO lệch). */
export function Reveal({ children, className, id, delay = 0, as = "section", y = 20 }: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = as === "section" ? motion.section : motion.div;

  return (
    <Comp
      id={id}
      className={className}
      initial={reduce ? { y: 0 } : { y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px 120px 0px" }}
      transition={{
        duration: reduce ? 0 : gentleDuration,
        ease: [...gentleEase],
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </Comp>
  );
}

type FadeProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Fade nhẹ khi mount: chỉ dịch Y (form vẫn đọc được ngay). */
export function FadeIn({ children, className, delay = 0 }: FadeProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { y: 0 } : { y: 12 }}
      animate={{ y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.45,
        ease: [...gentleEase],
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
