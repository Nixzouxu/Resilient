"use client";

import { motion } from "framer-motion";
import { HeartPulse, History, Server, ServerOff } from "lucide-react";
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

  const hasDown = metrics.down_services > 0;

  const cards = [
    {
      label: "Total layanan",
      value: String(metrics.total_services),
      note: "Layanan terdaftar aktif",
      icon: Server,
      isAlert: false,
      useDisplayFont: false,
    },
    {
      label: "Layanan down",
      value: String(metrics.down_services),
      note: hasDown ? "Butuh pengecekan segera" : "Tidak ada gangguan",
      icon: ServerOff,
      isAlert: hasDown,
      useDisplayFont: false,
    },
    {
      label: "Uptime 24 jam",
      value: uptimeDisplay,
      note:
        metrics.uptime_24h_pct === null
          ? "Belum ada data 24 jam"
          : "Rata-rata seluruh layanan",
      icon: HeartPulse,
      isAlert: false,
      useDisplayFont: true,
    },
    {
      label: "Insiden minggu ini",
      value: String(metrics.incidents_this_week),
      note: "Catatan gagal 7 hari terakhir",
      icon: History,
      isAlert: false,
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
              {/* Wadah ikon netral agar tenang; warna merah hanya muncul saat ada layanan down */}
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl border"
                style={{
                  backgroundColor: card.isAlert
                    ? "var(--rs-bad-soft)"
                    : "var(--rs-surface-inset)",
                  borderColor: card.isAlert
                    ? "var(--rs-bad-soft)"
                    : "var(--rs-line)",
                  color: card.isAlert ? "var(--rs-bad)" : "var(--rs-text-2)",
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
            </div>

            <p
              className={`mt-3 leading-none ${
                card.useDisplayFont
                  ? "rs-font-display text-4xl"
                  : "text-[28px] font-semibold tracking-tight"
              }`}
              style={{
                color: card.isAlert ? "var(--rs-bad)" : "var(--rs-text-1)",
              }}
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