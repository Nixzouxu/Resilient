import type { RefObject } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, ExternalLink, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { COMPOSE_TEXT, FEATURES, PLANS, REPO_URL, SECURITY, STATEMENT } from "./landing-data";
import { LayerStack } from "./layer-stack";

interface LandingViewProps {
  rootRef: RefObject<HTMLDivElement | null>;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  copied: boolean;
  onCopy: () => void;
}

export function LandingView({ rootRef, theme, onToggleTheme, copied, onCopy }: LandingViewProps) {
  return (
    <div ref={rootRef} className="rs-land" data-theme={theme}>
      <div className="rs-glow" aria-hidden="true" />

      <header className="rs-nav rs-in">
        <Logo size={34} withText priority />
        <nav className="hidden gap-7 text-sm md:flex" aria-label="Navigasi utama">
          <a href="#fitur" className="rs-link">Fitur</a>
          <a href="#keamanan" className="rs-link">Keamanan</a>
          <a href="#harga" className="rs-link">Deployment</a>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleTheme} className="rs-icon-btn" aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}>
            {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <Link href="/login" className="rs-btn rs-btn-grad">Mulai Sekarang</Link>
        </div>
      </header>

      <main>
        <section className="rs-hero mx-auto grid max-w-[1120px] items-center gap-10 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="rs-pill rs-in rs-hero-fade">Pemantauan self-hosted untuk institusi kecil</span>
            <h1 className="rs-display mt-6">
              <span className="rs-hero-line"><span>Observability</span></span>
              <span className="rs-hero-line"><span>tanpa batas untuk</span></span>
              <span className="rs-hero-line"><span><em>institusi publik.</em></span></span>
            </h1>
            <p className="rs-hero-fade rs-in mt-6 max-w-[34rem] text-lg leading-relaxed">
              Platform pemantauan layanan yang dirancang untuk puskesmas, kantor desa, dan sekolah. Hemat sumber daya, mudah dipasang, dan memberi kabar saat ada yang mati.
            </p>
            <div className="rs-hero-fade rs-in mt-9 flex flex-wrap gap-3">
              <a href="#harga" className="rs-btn rs-btn-grad">Deploy Sekarang <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="rs-btn rs-btn-ghost">Lihat di GitHub <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </div>
          <LayerStack />
        </section>

        <section className="rs-statement mx-auto max-w-[880px] px-6 py-24 text-center">
          <p className="rs-display-sm">
            {STATEMENT.split(" ").map((word, i) => (<span key={i}><span className="rs-word">{word}</span>{" "}</span>))}
          </p>
        </section>

        <section id="fitur" className="mx-auto max-w-[1120px] px-6 py-24">
          <div className="rs-reveal mx-auto mb-14 max-w-[40rem] text-center">
            <h2 className="rs-title">Pantau, ketahui, tindak lanjuti</h2>
            <p className="mt-4 text-lg">Semua yang dibutuhkan tim kecil untuk menjaga layanan tetap hidup, tanpa tim IT khusus.</p>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text, soon }) => (
              <article key={title} className="rs-col rs-reveal">
                <span className="rs-col-line" aria-hidden="true" />
                <span className="rs-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-5 flex items-center gap-2 text-base font-semibold" style={{ color: "var(--rs-text-1)" }}>
                  {title}{soon && <span className="rs-soon">Segera</span>}
                </h3>
                <p className="mt-2 text-sm leading-relaxed">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="keamanan" className="mx-auto max-w-[1120px] px-6 py-16">
          <div className="rs-card rs-reveal p-8 md:p-14">
            <h2 className="rs-title text-center">Dibangun tertutup sejak awal</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {SECURITY.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-5">
                  <span className="rs-icon shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "var(--rs-text-1)" }}>{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="instalasi" className="mx-auto grid max-w-[1120px] items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div className="rs-reveal">
            <h2 className="rs-title">Pasang agent dalam satu container</h2>
            <p className="mt-4 text-lg leading-relaxed">Agent ringan berjalan di jaringan Docker yang sama dengan server Anda, lalu melaporkan hasil pemeriksaan ke pusat.</p>
            <ul className="mt-8 space-y-3 text-sm">
              {["Satu container, tanpa instalasi tambahan", "Tersambung memakai kunci unik milik institusi", "Berjalan sendiri dan hidup kembali setelah restart"].map((t) => (
                <li key={t} className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0" style={{ color: "var(--rs-ok)" }} aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rs-card rs-reveal overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-3 text-sm" style={{ borderColor: "var(--rs-line)" }}>
              <span style={{ color: "var(--rs-text-1)" }}>docker-compose.yml</span>
              <button type="button" onClick={onCopy} className="rs-btn rs-btn-ghost !px-3 !py-1.5 text-xs">
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <pre className="overflow-x-auto p-6 text-[13px] leading-relaxed" style={{ background: "var(--rs-surface-2)", color: "var(--rs-text-1)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}><code>{COMPOSE_TEXT}</code></pre>
          </div>
        </section>

        <section id="harga" className="mx-auto max-w-[1120px] px-6 py-24">
          <div className="rs-reveal mx-auto mb-16 max-w-[40rem] text-center">
            <h2 className="rs-title">Pilih tempat Resilient berjalan</h2>
            <p className="mt-4 text-lg">Tiga cara memasang, sesuai kondisi jaringan institusi Anda.</p>
          </div>
          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <article key={plan.name} className={`rs-plan rs-spot rs-reveal flex flex-col p-8 ${plan.featured ? "rs-plan-featured md:-mt-4 md:mb-4" : "rs-card"}`}>
                <div className="flex items-center justify-between">
                  <span className="rs-num">0{i + 1}</span>
                  <span className={plan.featured ? "rs-pill rs-pill-grad" : "rs-pill"}>{plan.tag}</span>
                </div>
                <h3 className="rs-display-sm mt-8 !text-[1.9rem]">{plan.name}</h3>
                <p className="mt-3 text-sm leading-relaxed">{plan.text}</p>
                <ul className="mb-9 mt-7 flex-1 space-y-3 text-sm">
                  {plan.points.map((p) => (
                    <li key={p} className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0" style={{ color: "var(--rs-accent)" }} aria-hidden="true" />{p}</li>
                  ))}
                </ul>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={plan.featured ? "rs-btn rs-btn-grad justify-center" : "rs-btn rs-btn-ghost justify-center"}>
                  {plan.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-6 pb-24 pt-8">
          <div className="rs-card rs-reveal rs-cta grid items-center gap-8 overflow-hidden p-10 md:grid-cols-[1.3fr_1fr] md:p-14">
            <div>
              <h2 className="rs-display-sm">Layanan mati sekarang? Anda akan tahu lebih dulu.</h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="rs-btn rs-btn-grad">Mulai Sekarang <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <a href="#fitur" className="rs-btn rs-btn-ghost">Lihat fitur</a>
              </div>
            </div>
            <div className="rs-shard" aria-hidden="true" />
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-4 border-t px-6 py-10 text-sm md:flex-row" style={{ borderColor: "var(--rs-line)" }}>
        <Logo size={28} withText />
        <p>&copy; 2026 Tim Pengembang Resilient. Seluruh hak dilindungi.</p>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="rs-link">Kode sumber</a>
      </footer>
    </div>
  );
}