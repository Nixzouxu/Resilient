import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Efek cahaya latar khusus Dark Mode dari globals.css */}
      <div className="bg-glow-1" aria-hidden="true" />
      <div className="bg-glow-2" aria-hidden="true" />

      {/* Watermark 404 besar di latar belakang */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none font-bold leading-none tracking-tighter text-slate-900/[0.06] dark:text-white/[0.04]"
        style={{ fontSize: "clamp(10rem, 32vw, 24rem)" }}
      >
        404
      </span>

      {/* Konten utama di tengah */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="text-3xl font-semibold tracking-tight sm:text-5xl"
          style={{ color: "var(--text-main)" }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p
          className="mt-4 max-w-md text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--text-muted)" }}
        >
          Halaman yang Anda cari belum tersedia atau sedang dalam pengembangan.
          Kembali ke beranda atau lanjutkan pemantauan layanan di dashboard.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: "var(--highlight)" }}
          >
            Buka Dashboard
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 px-6 py-3 text-sm font-medium transition hover:bg-slate-200/50 dark:border-white/15 dark:hover:bg-white/10"
            style={{ color: "var(--text-main)" }}
          >
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}