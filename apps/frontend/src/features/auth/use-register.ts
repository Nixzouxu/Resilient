"use client";

import { FormEvent, useState } from "react";
import { ApiError, authApi } from "./auth-api";
import { RegisterFieldErrors } from "./types";

// Panjang password minimal. Backend belum memeriksa ini, jadi dijaga di sini.
const MIN_PASSWORD_LENGTH = 8;

// Logika kartu Daftar: isi form, validasi, panggilan API.
// onSuccess dipanggil dengan email yang baru didaftarkan, supaya
// kartu Masuk bisa langsung terisi email itu.
export function useRegister(onSuccess: (email: string) => void) {
  const [tenantName, setTenantName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): RegisterFieldErrors {
    const errors: RegisterFieldErrors = {};
    if (!tenantName.trim()) errors.tenantName = "Nama institusi wajib diisi.";
    if (!email.trim()) errors.email = "Email wajib diisi.";
    else if (!email.includes("@")) errors.email = "Format email belum benar.";
    if (!password) errors.password = "Password wajib diisi.";
    else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Mencegah browser memuat ulang halaman saat form dikirim.
    event.preventDefault();
    setError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const registeredEmail = email.trim();
      await authApi.register({
        tenant_name: tenantName.trim(),
        name: name.trim() || undefined,
        email: registeredEmail,
        password,
      });
      // Kosongkan form supaya password tidak tertinggal di layar.
      setTenantName("");
      setName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setIsLoading(false);
      onSuccess(registeredEmail);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  }

  return {
    tenantName,
    name,
    email,
    password,
    showPassword,
    fieldErrors,
    error,
    isLoading,
    setTenantName,
    setName,
    setEmail,
    setPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    handleSubmit,
  };
}