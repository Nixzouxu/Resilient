// Data yang dikirim ke POST /auth/login.
export interface LoginPayload {
  email: string;
  password: string;
}

// Data pengguna yang dibalas backend saat login berhasil.
export interface AuthUser {
  id: number;
  // Backend menambahkan nama pengguna di balasan login (bisa kosong untuk akun lama).
  name?: string | null;
  email: string;
  role: string;
  tenant_id: number;
}

// Bentuk balasan sukses POST /auth/login (sesuai auth.routes.js).
export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Data yang dikirim ke POST /auth/register.
// "name" boleh kosong, backend akan memakai bagian depan email.
export interface RegisterPayload {
  tenant_name: string;
  name?: string;
  email: string;
  password: string;
}

// Balasan sukses POST /auth/register. Backend memberi api_key tenant di sini,
// tapi halaman ini sengaja tidak menyimpan atau menampilkannya.
export interface RegisterResponse {
  message: string;
  tenant: { id: number; name: string };
  user: AuthUser;
}

// Pesan kesalahan per kolom form.
export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export interface RegisterFieldErrors {
  tenantName?: string;
  email?: string;
  password?: string;
}