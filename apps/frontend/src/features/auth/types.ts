// Data yang dikirim ke POST/auth/login

export interface LoginPayload{
    email: string;
    password: string;
}

// Data pengguna yang dibalas backend saat login berhasil.
export interface AuthUser{
    id: number;
    // BE menambahkan nama pengguna di balasan login (bisa kosong untuk akun lama).
    name?: string | null;
    email: string;
    role: string;
    tenant_id: number;
}

// bentuk balasan sukses POST /auth/login (sesuai auth.routes.js).
export interface LoginResponse {
    message: string;
    token: string;
    user: AuthUser;
}

// Pesan kesalahan per kolom form.
export interface LoginFieldErrors {
  email?: string;
  password?: string;
}