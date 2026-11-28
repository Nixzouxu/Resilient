"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatHourWib, formatTimeWib } from "./formatters";
import type { HealthCheckPoint, ServiceItem } from "./types";

interface LatencyChartProps {
  services: ServiceItem[];
  selectedServiceId: number | null;
  healthChecks: HealthCheckPoint[];
  isLoading: boolean;
  onSelectService: (serviceId: number) => void;
}

// Satu titik di grafik. Pemeriksaan yang gagal tidak punya latensi yang berarti
// (angkanya hanya lama waktu sampai gagal), jadi latencyMs dikosongkan supaya
// garis terputus, dan titiknya digambar di dasar grafik sebagai penanda gagal.
interface ChartPoint {
  ts: number;
  fullTime: string;
  isDown: boolean;
  latencyMs: number | null;
  downMarker: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
}

// Jam singkat untuk sumbu X. Titik dua dipakai agar mudah dibaca (19:09).
function formatTick(ts: number): string {
  return formatHourWib(new Date(ts).toISOString()).replace(".", ":");
}

function LatencyTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: "var(--rs-surface)",
        borderColor: "var(--rs-line-strong)",
        color: "var(--rs-text-1)",
      }}
    >
      <p className="font-medium">{point.fullTime}</p>
      {point.isDown ? (
        <p className="mt-1 font-medium" style={{ color: "var(--rs-bad)" }}>
          Tidak merespons
        </p>
      ) : (
        <p className="mt-1" style={{ color: "var(--rs-text-2)" }}>
          Latensi:{" "}
          <strong style={{ color: "var(--rs-text-1)" }}>{point.latencyMs} ms</strong>
        </p>
      )}
      <p style={{ color: "var(--rs-text-3)" }}>
        Status: {point.isDown ? "Bermasalah" : "Sehat"}
      </p>
    </div>
  );
}

export function LatencyChart({
  services,
  selectedServiceId,
  healthChecks,
  isLoading,
  onSelectService,
}: LatencyChartProps) {
  const { chartData, failedCount } = useMemo(() => {
    // Diurutkan dari yang terlama supaya garis selalu digambar searah waktu
    const sorted = [...healthChecks].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const points: ChartPoint[] = sorted
      .map((item) => {
        const isDown = item.status.toLowerCase() !== "up";
        return {
          ts: new Date(item.time).getTime(),
          fullTime: formatTimeWib(item.time),
          isDown,
          latencyMs: isDown ? null : item.response_time_ms,
          downMarker: isDown ? 0 : null,
        };
      })
      .filter((point) => !Number.isNaN(point.ts));

    return {
      chartData: points,
      failedCount: points.filter((point) => point.isDown).length,
    };
  }, [healthChecks]);

  return (
    <section className="rs-dash-card flex flex-col p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--rs-text-1)" }}
          >
            Latensi 24 jam
          </h3>
          <p className="text-xs" style={{ color: "var(--rs-text-3)" }}>
            Waktu respons pemeriksaan dalam milidetik (WIB)
          </p>
        </div>

        {services.length > 0 && (
          <select
            aria-label="Pilih layanan untuk grafik"
            value={selectedServiceId ?? ""}
            onChange={(event) => onSelectService(Number(event.target.value))}
            className="rounded-xl border px-3 py-2 text-xs font-medium"
            style={{
              backgroundColor: "var(--rs-surface-inset)",
              borderColor: "var(--rs-line)",
              color: "var(--rs-text-1)",
            }}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div
            className="flex h-full items-center justify-center rounded-xl text-xs"
            style={{
              backgroundColor: "var(--rs-surface-inset)",
              color: "var(--rs-text-3)",
            }}
          >
            Memuat riwayat pemeriksaan...
          </div>
        ) : chartData.length === 0 ? (
          <div
            className="flex h-full flex-col items-center justify-center rounded-xl px-4 text-center"
            style={{ backgroundColor: "var(--rs-surface-inset)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--rs-text-2)" }}>
              Belum ada data latensi 24 jam
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--rs-text-3)" }}>
              Jalankan agent pemantau agar riwayat pemeriksaan mulai tercatat.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 24, left: -12, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--rs-line)"
                strokeDasharray="3 3"
                vertical={false}
              />
              {/* Sumbu waktu numerik: label tersebar rata dan tidak berulang */}
              <XAxis
                dataKey="ts"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatTick}
                tickCount={5}
                tick={{ fill: "var(--rs-text-3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax / 10) * 10, 20)]}
                tick={{ fill: "var(--rs-text-3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit=" ms"
              />
              <Tooltip content={<LatencyTooltip />} />
              <Line
                type="stepAfter"
                dataKey="latencyMs"
                stroke="var(--rs-accent)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: "var(--rs-accent)" }}
              />
              {/* Penanda gagal: hanya titik di dasar grafik, tanpa garis */}
              <Line
                dataKey="downMarker"
                stroke="none"
                dot={{ r: 3.5, fill: "var(--rs-bad)", stroke: "none" }}
                activeDot={{ r: 5, fill: "var(--rs-bad)" }}
                isAnimationActive={false}
                legendType="none"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legenda memakai teks, jadi artinya tidak bergantung pada warna saja */}
      {!isLoading && chartData.length > 0 && (
        <ul
          className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs"
          style={{ color: "var(--rs-text-2)" }}
        >
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-0.5 w-4 rounded"
              style={{ backgroundColor: "var(--rs-accent)" }}
            />
            Latensi pemeriksaan yang berhasil
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--rs-bad)" }}
            />
            Gagal merespons ({failedCount}), ditandai di dasar grafik
          </li>
        </ul>
      )}
    </section>
  );
}