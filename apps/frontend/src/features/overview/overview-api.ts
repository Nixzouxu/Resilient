import type {
    HealthCheckPoint,
    OverviewMetrics,
    ServiceItem,
  } from "./types";
  
  // Error khusus agar komponen tahu apakah sesi habis (401) atau server bermasalah.
  export class OverviewApiError extends Error {
    readonly status: number;
  
    constructor(message: string, status: number) {
      super(message);
      this.name = "OverviewApiError";
      this.status = status;
    }
  }
  
  // Class pembungkus seluruh panggilan API halaman Overview.
  export class OverviewApi {
    private readonly baseUrl: string;
  
    constructor(baseUrl?: string) {
      const raw =
        baseUrl ??
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:3001";
      this.baseUrl = raw.replace(/\/+$/, "");
    }
  
    private async requestJson<T>(path: string, token: string): Promise<T> {
      let response: Response;
  
      try {
        response = await fetch(`${this.baseUrl}${path}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });
      } catch {
        throw new OverviewApiError(
          "Tidak bisa terhubung ke server backend. Pastikan server sedang berjalan lalu coba muat ulang.",
          0
        );
      }
  
      const body = await response.json().catch(() => null);
  
      if (!response.ok) {
        const serverMessage =
          body && typeof body.message === "string"
            ? body.message
            : `Permintaan gagal dengan kode ${response.status}.`;
        throw new OverviewApiError(serverMessage, response.status);
      }
  
      return body as T;
    }
  
    async getOverview(token: string): Promise<OverviewMetrics> {
      const res = await this.requestJson<{ data: OverviewMetrics }>(
        "/overview",
        token
      );
      return res.data;
    }
  
    async getServices(token: string): Promise<ServiceItem[]> {
      const res = await this.requestJson<{ data: ServiceItem[] }>(
        "/services",
        token
      );
      return Array.isArray(res.data) ? res.data : [];
    }
  
    async getServiceHealthChecks(
      token: string,
      serviceId: number,
      range: "24h" | "7d" | "30d" = "24h"
    ): Promise<HealthCheckPoint[]> {
      const res = await this.requestJson<{ data: HealthCheckPoint[] }>(
        `/services/${serviceId}/health-checks?range=${range}`,
        token
      );
      return Array.isArray(res.data) ? res.data : [];
    }
  }
  
  export const overviewApi = new OverviewApi();