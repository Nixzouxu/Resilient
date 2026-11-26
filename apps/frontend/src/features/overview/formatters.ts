import type { OverallStatus, ServiceStatus } from "./types";

// Mengubah waktu UTC dari database ke zona waktu WIB (Asia/Jakarta).
export function formatTimeWib(iso: string | null): string {
  if (!iso) return "Belum pernah";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Waktu tidak valid";

  const formatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${formatted} WIB`;
}

// Format jam singkat untuk sumbu X grafik 24 jam.
export function formatHourWib(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

// Label status layanan selalu dipasangkan dengan ikon agar ramah buta warna.
export function getServiceStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case "HEALTHY":
      return "Sehat";
    case "UNHEALTHY":
      return "Bermasalah";
    default:
      return "Belum dicek";
  }
}

// Judul dan keterangan banner dibuat singkat untuk pengguna non-teknis.
export function getBannerCopy(
  status: OverallStatus,
  totalServices: number,
  downServices: number
): { title: string; subtitle: string; badge: string } {
  if (totalServices === 0 || status === "UNKNOWN") {
    return {
      title: "Belum ada layanan dipantau",
      subtitle:
        "Tambahkan layanan pertama dan jalankan agent agar Resilient mulai memantau kesehatan sistem secara otomatis.",
      badge: "Menunggu data",
    };
  }

  if (status === "DEGRADED" || downServices > 0) {
    return {
      title: `${downServices} layanan bermasalah`,
      subtitle:
        "Segera periksa layanan yang berstatus bermasalah pada tabel di bawah agar operasional tetap lancar.",
      badge: "Perlu perhatian",
    };
  }

  return {
    title: "Semua layanan sehat",
    subtitle: `${totalServices} layanan berjalan normal dan merespons pemeriksaan tepat waktu.`,
    badge: "Semua normal",
  };
}