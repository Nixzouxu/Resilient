// Bentuk data hasil pengecekan: statusnya naik atau turun,
// dan berapa lama service membalas (dalam milidetik).
export interface HealthResult {
  status: "up" | "down";
  responseTimeMs: number;
}

// Kerangka (abstract class) untuk semua jenis pengecek kesehatan.
// Class ini tidak bisa dipakai langsung. Class turunannya (HttpHealthCheck,
// nanti DockerHealthCheck) wajib punya method check() sendiri, tapi dari luar
// semuanya dipanggil dengan cara yang sama (Abstraction dan Inheritance, SDD 8).
export abstract class BaseHealthCheck {
  abstract check(): Promise<HealthResult>;
}