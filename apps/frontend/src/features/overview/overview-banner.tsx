"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CircleDashed, RotateCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { getBannerCopy } from "./formatters";
import type { OverviewMetrics } from "./types";

interface OverviewBannerProps {
  metrics: OverviewMetrics;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function OverviewBanner({
  metrics,
  isRefreshing,
  onRefresh,
}: OverviewBannerProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Latar gambar bergeser pelan ke bawah saat pengguna scroll melewati banner.
  const artY = useTransform(scrollYProgress, [0, 1], [0, 32]);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  const copy = getBannerCopy(
    metrics.overall_status,
    metrics.total_services,
    metrics.down_services
  );

  const isDegraded =
    metrics.overall_status === "DEGRADED" || metrics.down_services > 0;
  const isUnknown =
    metrics.total_services === 0 || metrics.overall_status === "UNKNOWN";

  const badgeStyle = isUnknown
    ? { backgroundColor: "rgba(230, 184, 92, 0.16)", color: "#e6b85c" }
    : isDegraded
      ? { backgroundColor: "rgba(240, 138, 147, 0.18)", color: "#f08a93" }
      : { backgroundColor: "rgba(95, 208, 160, 0.16)", color: "#5fd0a0" };

  return (
    <section
      ref={sectionRef}
      className="rs-dash-banner p-6 sm:p-8"
      aria-label="Status sistem"
    >
      {/* Lapisan gambar dekoratif dengan efek parallax halus saat halaman di-scroll */}
      <motion.div
        className="rs-dash-banner-art"
        style={{ y: artY, scale: artScale }}
        aria-hidden="true"
      />
      <div className="rs-dash-banner-scrim" aria-hidden="true" />

      <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-xl space-y-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={badgeStyle}
          >
            {isUnknown ? (
              <CircleDashed className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            ) : isDegraded ? (
              <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            )}
            {copy.badge}
          </span>

          <h2 className="rs-font-display text-3xl leading-tight tracking-normal text-[#edf0fb] sm:text-[40px]">
            {copy.title}
          </h2>

          <p className="text-sm leading-relaxed text-[#b7c0d8]">
            {copy.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-medium text-[#edf0fb] backdrop-blur-sm transition-colors hover:bg-white/15 disabled:opacity-60"
        >
          <RotateCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          {isRefreshing ? "Memuat..." : "Muat ulang"}
        </button>
      </div>
    </section>
  );
}