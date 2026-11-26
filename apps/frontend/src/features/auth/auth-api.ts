import { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "./types";

// Error khusus supaya tampilan hanya perlu menampilkan message-nya.
// Semua pesan di sini sudah dalam bahasa yang ramah untuk pengguna.
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// Semua komunikasi ke endpoint /auth ada di satu class ini.
// Kalau alamat atau bentuk balasan backend berubah, cukup ubah di sini.
export class AuthApi {
  constructor(private baseUrl: string) {}

  login(payload: LoginPayload): Promise<LoginResponse> {
    return this.post<LoginResponse>("/auth/login", payload);
  }

  register(payload: RegisterPayload): Promise<RegisterResponse> {
    return this.post<RegisterResponse>("/auth/register", payload);
  }

  // Satu pintu untuk semua permintaan POST, supaya penanganan error
  // (server mati, balasan bukan JSON, status error) cukup ditulis sekali.
  private async post<T>(path: string, payload: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // Tanpa balasan dalam 8 detik dianggap gagal, supaya tombol
        // tidak berputar selamanya kalau backend tidak merespons.
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new ApiError("Tidak bisa terhubung ke server. Coba lagi sebentar lagi.");
    }

    // Balasan error bisa saja bukan JSON, jadi dibaca dengan aman.
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      // Backend memakai 400 untuk isian salah dan 409 untuk email yang sudah terdaftar.
      const message = body?.message ?? "Terjadi kesalahan di server. Coba lagi nanti.";
      throw new ApiError(message, res.status);
    }

    return body as T;
  }
}

// Alamat backend dibaca dari environment. Kalau tidak diisi, pakai port backend di compose.
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export const authApi = new AuthApi(baseUrl);