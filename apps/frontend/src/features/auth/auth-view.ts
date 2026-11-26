// Tiga kartu di halaman auth. Urutan di bawah ini juga urutan posisinya
// dari kiri ke kanan: Daftar di kiri, Masuk di tengah, Lupa password di kanan.
export type AuthView = "register" | "login" | "forgot";

export const AUTH_ORDER: AuthView[] = ["register", "login", "forgot"];