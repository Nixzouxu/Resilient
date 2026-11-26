export type OverallStatus = "HEALTHY" | "DEGRADED" | "UNKNOWN";

export type ServiceStatus = "HEALTHY" | "UNHEALTHY" | "UNKNOWN";

// Bentuk data dari GET /overview
export interface OverviewMetrics {
  total_services: number;
  down_services: number;
  uptime_24h_pct: number | null;
  incidents_this_week: number;
  overall_status: OverallStatus;
}

// Bentuk tiap baris layanan dari GET /services
export interface ServiceItem {
  id: number;
  tenant_id: number;
  name: string;
  type: string;
  endpoint_url: string | null;
  container_name: string | null;
  check_interval: number;
  status: ServiceStatus;
  consecutive_failures: number;
  last_checked_at: string | null;
  created_at: string;
}

// Bentuk tiap titik pemeriksaan dari GET /services/:id/health-checks
export interface HealthCheckPoint {
  time: string;
  status: string;
  response_time_ms: number;
}

// Ringkasan insiden yang ditampilkan di linimasa
export interface IncidentItem {
  id: string;
  serviceId: number;
  serviceName: string;
  time: string;
  responseTimeMs: number;
  note: string;
}