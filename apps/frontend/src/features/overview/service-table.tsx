import { Server } from "lucide-react";
import { formatTimeWib } from "./formatters";
import { StatusBadge } from "./status-badge";
import type { ServiceItem } from "./types";

interface ServiceTableProps {
  services: ServiceItem[];
  selectedServiceId: number | null;
  onSelectService: (serviceId: number) => void;
}

export function ServiceTable({
  services,
  selectedServiceId,
  onSelectService,
}: ServiceTableProps) {
  return (
    <section id="tabel-layanan" className="rs-dash-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--rs-text-1)" }}
          >
            Kesehatan layanan
          </h3>
          <p className="text-xs" style={{ color: "var(--rs-text-3)" }}>
            Klik salah satu baris untuk melihat grafik latensinya
          </p>
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--rs-text-3)" }}>
          {services.length} layanan
        </span>
      </div>

      {services.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl px-4 py-10 text-center"
          style={{ backgroundColor: "var(--rs-surface-inset)" }}
        >
          <span
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "var(--rs-accent-soft)",
              color: "var(--rs-accent)",
            }}
          >
            <Server className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold" style={{ color: "var(--rs-text-1)" }}>
            Belum ada layanan terdaftar
          </p>
          <p className="mt-1 max-w-md text-xs" style={{ color: "var(--rs-text-3)" }}>
            Tambahkan layanan pertama lewat endpoint POST /services atau halaman Layanan agar Resilient mulai memantau uptime secara berkala.
          </p>
        </div>
      ) : (
        <>
          {/* Tampilan tabel untuk layar tablet dan desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr
                  className="border-b text-xs"
                  style={{
                    borderColor: "var(--rs-line)",
                    color: "var(--rs-text-3)",
                  }}
                >
                  <th className="pb-3 font-medium">Layanan</th>
                  <th className="pb-3 font-medium">Tipe</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Interval</th>
                  <th className="pb-3 font-medium">Gagal beruntun</th>
                  <th className="pb-3 font-medium">Terakhir dicek</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--rs-line)" }}>
                {services.map((service) => {
                  const isSelected = service.id === selectedServiceId;
                  return (
                    <tr
                      key={service.id}
                      onClick={() => onSelectService(service.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--rs-surface-inset)"
                          : "transparent",
                        borderColor: "var(--rs-line)",
                      }}
                    >
                      <td className="py-3.5 pr-4">
                        <p
                          className="font-medium"
                          style={{ color: "var(--rs-text-1)" }}
                        >
                          {service.name}
                        </p>
                        <p
                          className="max-w-xs truncate text-xs"
                          style={{ color: "var(--rs-text-3)" }}
                        >
                          {service.endpoint_url || service.container_name || "-"}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-xs">{service.type}</td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={service.status} />
                      </td>
                      <td className="py-3.5 pr-4 text-xs">
                        {service.check_interval} detik
                      </td>
                      <td className="py-3.5 pr-4 text-xs">
                        {service.consecutive_failures}x
                      </td>
                      <td
                        className="py-3.5 text-xs"
                        style={{ color: "var(--rs-text-3)" }}
                      >
                        {formatTimeWib(service.last_checked_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tampilan daftar kartu untuk layar ponsel */}
          <div className="space-y-3 md:hidden">
            {services.map((service) => {
              const isSelected = service.id === selectedServiceId;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onSelectService(service.id)}
                  className="w-full rounded-xl border p-4 text-left"
                  style={{
                    backgroundColor: "var(--rs-surface-inset)",
                    borderColor: isSelected
                      ? "var(--rs-accent)"
                      : "var(--rs-line)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{ color: "var(--rs-text-1)" }}
                      >
                        {service.name}
                      </p>
                      <p
                        className="truncate text-xs"
                        style={{ color: "var(--rs-text-3)" }}
                      >
                        {service.endpoint_url || service.container_name || "-"}
                      </p>
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                  <div
                    className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs"
                    style={{ color: "var(--rs-text-3)" }}
                  >
                    <span>Tipe: {service.type}</span>
                    <span>Interval: {service.check_interval} dtk</span>
                    <span>Dicek: {formatTimeWib(service.last_checked_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}