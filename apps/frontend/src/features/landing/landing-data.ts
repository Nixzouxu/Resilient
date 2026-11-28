import { Activity, Bell, FileText, Key, Lock, RefreshCw, Shield, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FeatureItem { icon: LucideIcon; title: string; text: string; soon?: boolean }
export interface PlanItem { name: string; tag: string; text: string; points: string[]; cta: string; featured?: boolean }

export const REPO_URL = "https://github.com/Nixzouxu/Resilient";

// Fitur yang belum jadi diberi tanda "Segera" supaya halaman ini jujur soal kondisi produk
export const FEATURES: FeatureItem[] = [
  { icon: Activity, title: "Pemantauan Uptime", text: "Agent memeriksa layanan Anda secara berkala. Layanan yang mati ketahuan dalam waktu singkat." },
  { icon: Bell, title: "Peringatan Telegram", text: "Pesan langsung ke Telegram saat layanan berubah menjadi bermasalah, tanpa perlu membuka dasbor." },
  { icon: FileText, title: "Log Terpusat", text: "Kumpulkan log dari berbagai sumber di satu tempat agar penyebab masalah mudah dicari.", soon: true },
  { icon: RefreshCw, title: "Pemulihan Otomatis", text: "Menjalankan ulang container yang bermasalah tanpa menunggu teknisi datang.", soon: true },
];

export const SECURITY: FeatureItem[] = [
  { icon: Shield, title: "Data tiap institusi terpisah", text: "Setiap institusi punya ruang kerja sendiri. Layanan dan data satu institusi tidak terlihat oleh institusi lain." },
  { icon: Lock, title: "Masuk dengan token", text: "Dasbor dilindungi login. Setiap permintaan membawa token yang kedaluwarsa dalam 24 jam." },
  { icon: Key, title: "Kunci akses per institusi", text: "Agent tersambung memakai kunci unik, sehingga data yang dikirim selalu masuk ke ruang kerja yang benar." },
  { icon: ShieldCheck, title: "Kata sandi tidak disimpan polos", text: "Kata sandi pengguna disimpan dalam bentuk hash, jadi tidak bisa dibaca bahkan oleh pengelola server." },
];

export const PLANS: PlanItem[] = [
  { name: "Uji Coba Lokal", tag: "Belajar dan evaluasi", text: "Cocok untuk mencoba Resilient di komputer sendiri sebelum dipasang sungguhan.", points: ["Database ringan lokal", "Agent tunggal sederhana", "Satu perintah Docker Compose"], cta: "Lihat Panduan Dasar" },
  { name: "Server Institusi", tag: "Pilihan utama", featured: true, text: "Paling ideal untuk dinas dan puskesmas yang ingin data tetap berada di dalam wilayah sendiri.", points: ["Jaringan internal tertutup", "Notifikasi Telegram penuh", "Cocok untuk banyak layanan"], cta: "Panduan Produksi" },
  { name: "Server Awan Publik", tag: "Akses dari mana saja", text: "Untuk institusi yang membutuhkan dasbor yang bisa dibuka dari internet.", points: ["Dapat diakses dari mana saja", "Domain dan HTTPS lewat tunnel", "Mudah ditambah institusi baru"], cta: "Panduan Awan" },
];

// Sama persis dengan konfigurasi agent di docker-compose.prod.yml repo ini
export const COMPOSE_TEXT = `agent:
  build: ./apps/agent
  restart: unless-stopped
  environment:
    RESILIENT_BACKEND_URL: http://backend:3001
    RESILIENT_API_KEY: \${AGENT_API_KEY}`;

export const STATEMENT =
  "Institusi kecil jarang punya tim IT yang berjaga sepanjang waktu. Resilient memantau layanan Anda dan mengirim peringatan ke Telegram, sebelum pasien atau warga yang menyadari ada yang mati.";