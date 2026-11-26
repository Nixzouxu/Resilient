import { ReactNode } from "react";
import "./auth.css";
import { Theme } from "./use-theme";

// Pembungkus halaman auth: memasang tema, latar (garis kisi, bintang, cahaya),
// dan judul tersembunyi untuk pembaca layar.
// Tema dipasang lewat atribut di pembungkus ini saja, jadi tidak
// mengubah tema halaman lain seperti landing page.
export function AuthShell({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <div className="auth-root" data-theme={theme}>
      <div className="auth-backdrop" aria-hidden="true">
        <div className="auth-backdrop-grid" />
        <div className="auth-backdrop-stars" />
        <div className="auth-backdrop-glow" />
      </div>
      <main className="auth-main">
        <h1 className="sr-only">Masuk atau daftar ke Resilient</h1>
        {children}
      </main>
    </div>
  );
}