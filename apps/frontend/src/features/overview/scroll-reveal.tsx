"use client";

import type { ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

// Kurva gerak disamakan dengan --rs-ease di dashboard-tokens.css agar terasa seragam.
const SMOOTH_EASE = [0.22, 0.8, 0.3, 1] as const;

// Membungkus tiap bagian dashboard supaya muncul perlahan saat masuk layar ketika di-scroll.
export function ScrollReveal({
  children,
  delay = 0,
  y = 28,
  className,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.55,
        delay,
        ease: SMOOTH_EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

// Garis tipis di bawah topbar yang memanjang mulus mengikuti posisi scroll halaman.
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left"
      style={{
        scaleX,
        backgroundColor: "var(--rs-accent)",
      }}
    />
  );
}