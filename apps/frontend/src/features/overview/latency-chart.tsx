"use client";

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

interface ChartPoint {
  timeLabel: string;
  fullTime: string;
  responseTimeMs: number;
  statusLabel: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
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
      <p className="mt-1" style={{ color: "var(--rs-text-2)" }}>
        Latensi: <strong style={{ color: "var(--rs-text-1)" }}>{point.responseTimeMs} ms</strong>
      </p>
      <p style={{ color: "var(--rs-text-3)" }}>Status: {point.statusLabel}</p>
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
  const chartData: ChartPoint[] = healthChecks.map((item) => ({
    timeLabel: formatHourWib(item.time),
    fullTime: formatTimeWib(item.time),
    responseTimeMs: item.response_time_ms,
    statusLabel: item.status.toLowerCase() === "up" ? "Sehat" : "Bermasalah",
  }));

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
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--rs-line)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="timeLabel"
                tick={{ fill: "var(--rs-text-3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "var(--rs-text-3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit=" ms"
              />
              <Tooltip content={<LatencyTooltip />} />
              <Line
                type="stepAfter"
                dataKey="responseTimeMs"
                stroke="var(--rs-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--rs-accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}