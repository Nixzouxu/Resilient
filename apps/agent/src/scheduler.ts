import { BackendClient, RemoteService, describeError } from "./backend-client";
import { BaseHealthCheck } from "./health-check/base-health-check";
import { HttpHealthCheck } from "./health-check/http-health-check";

// Interval terkecil yang diizinkan (detik). Mencegah service dicek terlalu
// rapat kalau nilai di database terlanjur kecil atau salah.
const MIN_INTERVAL_SECONDS = 5;

// Satu pekerjaan berkala milik satu service.
interface Job {
  timer: NodeJS.Timeout;
  // Ciri service saat job dibuat. Kalau berubah (URL atau interval diedit
  // admin), job lama dihentikan dan dibuat ulang.
  signature: string;
}

export class Scheduler {
  private jobs = new Map<number, Job>();

  constructor(private client: BackendClient) {}

  // Ambil daftar service terbaru dari backend lalu selaraskan job yang berjalan:
  // service baru dimulai, service yang diubah diulang, service yang dihapus dihentikan.
  async sync(): Promise<void> {
    let services: RemoteService[];
    try {
      services = await this.client.getServices();
    } catch (err) {
      // Gagal ambil daftar tidak boleh mematikan agent.
      // Job lama tetap jalan memakai daftar terakhir yang diketahui.
      console.error(`Gagal ambil daftar service. ${describeError(err)}`);
      return;
    }

    const activeIds = new Set<number>();
    for (const service of services) {
      const checker = this.createChecker(service);
      if (!checker) continue;

      activeIds.add(service.id);
      const intervalMs = Math.max(service.check_interval, MIN_INTERVAL_SECONDS) * 1000;
      const signature = `${service.endpoint_url}|${intervalMs}`;
      const existing = this.jobs.get(service.id);

      if (existing?.signature === signature) continue;
      if (existing) clearInterval(existing.timer);

      console.log(`Mulai pantau service ${service.id} (${service.endpoint_url}) tiap ${intervalMs / 1000} detik`);
      const run = () => this.runOnce(service.id, checker);
      // Langsung cek sekali supaya hasil pertama tidak menunggu satu interval penuh.
      run();
      this.jobs.set(service.id, { timer: setInterval(run, intervalMs), signature });
    }

    // Hentikan job milik service yang sudah dihapus dari backend.
    for (const [id, job] of this.jobs) {
      if (!activeIds.has(id)) {
        clearInterval(job.timer);
        this.jobs.delete(id);
        console.log(`Berhenti memantau service ${id} (sudah tidak ada di backend)`);
      }
    }
  }

  stop(): void {
    for (const job of this.jobs.values()) clearInterval(job.timer);
    this.jobs.clear();
  }

  // Memilih pengecek sesuai tipe service. Tipe lain (docker) menyusul di Fase 2.
  private createChecker(service: RemoteService): BaseHealthCheck | null {
    if (service.type?.toLowerCase() === "http" && service.endpoint_url) {
      return new HttpHealthCheck(service.endpoint_url);
    }
    console.warn(`Service ${service.id} dilewati: tipe "${service.type}" belum didukung atau endpoint_url kosong`);
    return null;
  }

  private async runOnce(serviceId: number, checker: BaseHealthCheck): Promise<void> {
    const result = await checker.check();
    try {
      await this.client.sendResult(serviceId, result);
      console.log(`Service ${serviceId}: ${result.status} (${result.responseTimeMs} ms)`);
    } catch (err) {
      // Gagal kirim tidak boleh menghentikan agent, cukup dicatat.
      console.error(`Gagal kirim hasil service ${serviceId}. ${describeError(err)}`);
    }
  }
}
