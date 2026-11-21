import axios from "axios";
import { config } from "./config";
import { HealthResult } from "./health-check/base-health-check";

// Bentuk satu service dari backend (GET /agent/agent/services).
export interface RemoteService {
  id: number;
  type: string;
  endpoint_url: string | null;
  container_name: string | null;
  check_interval: number;
}

// Semua komunikasi dengan backend ada di satu class ini,
// supaya kalau path atau header berubah, cukup ubah di sini.
export class BackendClient {
  // Backend mengenali tenant dari header ini, jadi tenant_id tidak perlu dikirim.
  private headers = { "x-api-key": config.apiKey };

  async getServices(): Promise<RemoteService[]> {
    // Path berulang ("/agent/agent/services") karena router dipasang di /agent
    // dan nama route di dalamnya juga diawali /agent. Sesuai kode backend saat ini.
    const res = await axios.get(`${config.backendUrl}/agent/agent/services`, {
      headers: this.headers,
      timeout: 5000,
    });
    return res.data.data;
  }

  async sendResult(serviceId: number, result: HealthResult): Promise<void> {
    await axios.post(
      `${config.backendUrl}/agent/health-checks/ingest`,
      { serviceId, ...result },
      { headers: this.headers, timeout: 5000 },
    );
  }
}

// Mengubah error axios jadi pesan yang mudah dipahami.
// 401 dan 403 dibedakan karena artinya API key di .env salah, bukan backend mati.
export function describeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      return `API key atau service ditolak backend (status ${status}). Cek RESILIENT_API_KEY di .env agent.`;
    }
    if (status) return `Backend membalas error status ${status}.`;
    return `Backend tidak bisa dihubungi (${err.code ?? "error jaringan"}).`;
  }
  return String(err);
}