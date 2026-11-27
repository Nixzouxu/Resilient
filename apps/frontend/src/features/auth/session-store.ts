import { AuthUser } from "./types";

const TOKEN_KEY = "resilient_token";
const USER_KEY = "resilient_user";

// Menyimpan token login di browser. Dipisah jadi satu class supaya
// kalau nanti pindah ke cookie, cukup ubah file ini.
// Pengecekan "window" perlu karena Next.js juga menjalankan kode di server.
export class SessionStore {
  save(token: string, user: AuthUser): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  }

  // Membaca data akun dari browser secara aman.
  // Memakai try-catch supaya aplikasi tidak rusak jika data tersimpan korup.
  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

export const sessionStore = new SessionStore();