import type { Metadata } from "next";
import { AuthContainer } from "@/features/auth/auth-container";

export const metadata: Metadata = {
  title: "Masuk | Resilient",
};

// Halaman ini sengaja tipis. Semua isinya ada di folder features/auth.
export default function LoginPage() {
  return <AuthContainer />;
}