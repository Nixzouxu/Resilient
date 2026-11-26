"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, Clock, Server } from "lucide-react";
import type { OverviewMetrics } from "./types";

interface SummaryCardsProps {
  metrics: OverviewMetrics;
}

const SMOOTH_EASE = [0.22, 0.8, 0.3, 1] as const;

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const uptimeDisplay =
    metrics.uptime_24h_pct === null
      ? "-"
      : `${metrics.uptime_24h_pct.toFixed(1)}%`;

  const cards = [
    {
      label: "Total layanan",
      value: String(metrics.total_services),
      note: "Layanan terdaftar aktif",
      icon: Server,
      iconBg: "var(--rs-accent-soft)",
      iconColor: "var(--rs-accent)",
      useDisplayFont: false,
    },
    {
      label: "Layanan down",
      value: String(metrics.down_services),
      note:
        metrics.down_services > 0
          ? "Butuh pengecekan segera"
          : "Tidak ada gangguan",
      icon: AlertTriangle,
      iconBg:
        metrics.down_services > 0 ? "var(--rs-bad-soft)" : "var(--rs-ok-soft)",
      iconColor: metrics.down_services > 0 ? "var(--rs-bad)" : "var(--rs-ok)",
      useDisplayFont: false,
    },
    {
      label: "Uptime 24 jam",
      value: uptimeDisplay,
      note:
        metrics.uptime_24h_pct === null
          ? "Belum ada data 24 jam"
          : "Rata-rata seluruh layanan",
      icon: Activity,
      iconBg: "var(--rs-ok-soft)",
      iconColor: "var(--rs-ok)",
      useDisplayFont: true,
    },
    {
      label: "Insiden minggu ini",
      value: String(metrics.incidents_this_week),
      note: "Catatan gagal 7 hari terakhir",
      icon: Clock,
      iconBg: "var(--rs-warn-soft)",
      iconColor: "var(--rs-warn)",
      useDisplayFont: false,
    },
  ];

  return (
    <section
      aria-label="Ringkasan metrik"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.label}
            className="rs-dash-card p-5"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.36,
              delay: index * 0.055,
              ease: SMOOTH_EASE,
            }}
            whileHover={{
              y: -3,
              transition: { duration: 0.18, ease: SMOOTH_EASE },
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className="text-xs font-medium"
                style={{ color: "var(--rs-text-3)" }}
              >
                {card.label}
              </p>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: card.iconBg,
                  color: card.iconColor,
                }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            <p
              className={`mt-3 leading-none ${
                card.useDisplayFont
                  ? "rs-font-display text-4xl"
                  : "text-[28px] font-semibold tracking-tight"
              }`}
              style={{ color: "var(--rs-text-1)" }}
            >
              {card.value}
            </p>

            <p className="mt-2 text-xs" style={{ color: "var(--rs-text-3)" }}>
              {card.note}
            </p>
          </motion.article>
        );
      })}
    </section>
  );
}