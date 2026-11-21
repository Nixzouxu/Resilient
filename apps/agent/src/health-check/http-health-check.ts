import axios from "axios";
import { BaseHealthCheck, HealthResult } from "./base-health-check";

// Pengecek yang menguji service lewat permintaan HTTP biasa.
export class HttpHealthCheck extends BaseHealthCheck {
  // Alamat disimpan lewat constructor, jadi satu class ini bisa dipakai
  // untuk banyak service dengan alamat berbeda.
  constructor(private endpointUrl: string) {
    super();
  }

  async check(): Promise<HealthResult> {
    // Catat waktu mulai untuk menghitung berapa lama service membalas.
    const start = Date.now();
    try {
      // Tanpa balasan dalam 5 detik dianggap gagal, supaya agent
      // tidak menunggu selamanya pada service yang mati.
      await axios.get(this.endpointUrl, { timeout: 5000 });
      return { status: "up", responseTimeMs: Date.now() - start };
    } catch {
      // Error jaringan, timeout, atau status error dari server: dianggap down.
      return { status: "down", responseTimeMs: Date.now() - start };
    }
  }
}