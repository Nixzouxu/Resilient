import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatTimeWib } from "./formatters";
import type { IncidentItem } from "./types";

interface IncidentTimelineProps {
  incidents: IncidentItem[];
}

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  return (
    <section className="rs-dash-card flex flex-col p-5 sm:p-6">
      <div className="mb-4">
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--rs-text-1)" }}
        >
          Linimasa insiden
        </h3>
        <p className="text-xs" style={{ color: "var(--rs-text-3)" }}>
          Catatan gangguan 24 jam terakhir pada layanan terpilih
        </p>
      </div>

      {incidents.length === 0 ? (
        <div
          className="flex flex-1 flex-col items-center justify-center rounded-xl p-6 text-center"
          style={{ backgroundColor: "var(--rs-surface-inset)" }}
        >
          <span
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: "var(--rs-ok-soft)",
              color: "var(--rs-ok)",
            }}
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium" style={{ color: "var(--rs-text-1)" }}>
            Tidak ada insiden
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--rs-text-3)" }}>
            Semua pemeriksaan layanan ini berjalan lancar dalam 24 jam terakhir.
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {incidents.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border p-3"
              style={{
                backgroundColor: "var(--rs-surface-inset)",
                borderColor: "var(--rs-line)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "var(--rs-bad-soft)",
                    color: "var(--rs-bad)",
                  }}
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold"
                    style={{ color: "var(--rs-text-1)" }}
                  >
                    {item.serviceName}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--rs-text-2)" }}>
                    {item.note}
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: "var(--rs-text-3)" }}>
                    {formatTimeWib(item.time)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}