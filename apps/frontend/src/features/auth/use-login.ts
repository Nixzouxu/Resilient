"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, authApi } from "./auth-api";
import { sessionStore } from "./session-store";
import { LoginFieldErrors } from "./types";

// Hook ini menyimpan semua logika halaman login: isi form, validasi,
// pemanggilan API, dan pindah halaman. Tampilannya sendiri ada di login-form.tsx.
export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validasi sederhana di sisi browser supaya pengguna langsung tahu
  // kolom mana yang kurang, tanpa menunggu balasan server.
  function validate(): LoginFieldErrors {
    const errors: LoginFieldErrors = {};
    if (!email.trim()) errors.email = "Email wajib diisi.";
    else if (!email.includes("@")) errors.email = "Format email belum benar.";
    if (!password) errors.password = "Password wajib diisi.";
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
      const result = await authApi.login({ email: email.trim(), password });
      sessionStore.save(result.token, result.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
    // Saat berhasil, isLoading sengaja dibiarkan true sampai halaman berpindah,
    // supaya tombol tidak bisa ditekan dua kali.
  }

  return {
    email,
    password,
    showPassword,
    fieldErrors,
    error,
    isLoading,
    setEmail,
    setPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    handleSubmit,
  };
}