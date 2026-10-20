// Direktif ini menandai komponen sebagai Client Component
// Artinya komponen ini berjalan di sisi browser, bukan server
// Diperlukan karena kita menggunakan useState dan useEffect
'use client';

import React, { useState, useEffect } from 'react';

// Mengimpor semua ikon yang dibutuhkan dari pustaka lucide-react
import {
  Activity, CheckCircle, AlertTriangle, XCircle,
  Copy, Check, Shield, Server, Terminal, Lock,
  Key, Users, Bell, FileText, RefreshCw, BarChart2,
  ExternalLink, Moon, Sun
} from 'lucide-react';

// Mengimpor komponen grafik dari pustaka recharts
// AreaChart digunakan untuk grafik latensi dengan area terisi di bawah garis
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

// Mengimpor motion dari framer-motion untuk animasi yang mulus
import { motion } from 'framer-motion';


// Data simulasi untuk grafik latensi jaringan
// Setiap objek berisi waktu pengukuran dan nilai latensi dalam milidetik
const dataLatensi = [
  { waktu: '10:00', nilai: 45 },
  { waktu: '10:05', nilai: 52 },
  { waktu: '10:10', nilai: 48 },
  { waktu: '10:15', nilai: 61 },
  { waktu: '10:20', nilai: 49 },
  { waktu: '10:25', nilai: 120 },
  { waktu: '10:30', nilai: 42 },
];


// Komponen logo huruf R kustom untuk Resilient
// Dibuat menggunakan SVG murni dengan teknik stroke agar tajam di semua ukuran layar
// Terdiri dari dua jalur: tiang utama dan kaki miring dengan warna biru berbeda
const LogoResilient = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Jalur tiang tegak dan lengkungan atas huruf R */}
    <path
      d="M13 31 V9 h7 c3.866 0 7 3.134 7 7 s-3.134 7 -7 7 h-7"
      stroke="#3b82f6"
      strokeWidth="6.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Jalur kaki miring bawah huruf R dengan warna biru lebih terang */}
    <path
      d="M18.5 22.5 L26 31"
      stroke="#0ea5e9"
      strokeWidth="6.5"
      strokeLinecap="round"
    />
  </svg>
);


// Komponen utama halaman pendaratan Resilient
export default function HalamanUtama() {

  // Status apakah tombol salin kode sudah diklik
  const [disalin, setDisalin] = useState(false);

  // Status tema yang sedang aktif: true berarti tema gelap, false berarti tema terang
  // Bawaan tema gelap agar tampilan Glassmorphism terlihat maksimal
  const [temaGelap, setTemaGelap] = useState(true);

  // Efek samping: setiap kali temaGelap berubah, tambahkan atau hapus kelas dark pada elemen html
  // Kelas dark inilah yang mengaktifkan variabel CSS tema gelap di globals.css
  useEffect(() => {
    if (temaGelap) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [temaGelap]);

  // Isi teks konfigurasi Docker Compose yang akan disalin pengguna
  const teksDockerCompose = `version: '3.8'
services:
  resilient-agent:
    image: resilient/agent:latest
    environment:
      - API_KEY=kunci_rahasia_anda
      - SERVER_URL=https://resilient.domain-anda.go.id
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped`;

  // Fungsi untuk menyalin teks konfigurasi ke papan klip browser
  // Setelah tersalin, tampilkan ikon centang selama 2 detik lalu kembali ke ikon salin
  const salinKePapanKlip = () => {
    navigator.clipboard.writeText(teksDockerCompose);
    setDisalin(true);
    setTimeout(() => setDisalin(false), 2000);
  };

  return (
    // Pembungkus seluruh halaman dengan warna teks menyesuaikan tema aktif
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">

      {/* Dua elemen dekorasi cahaya radial di latar belakang */}
      {/* Hanya muncul saat tema gelap aktif, diatur melalui CSS di globals.css */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>


      {/* ============================================================
          NAVIGASI ATAS
          Selalu menempel di bagian atas saat halaman digulir (sticky)
          Menggunakan efek kaca transparan dari kelas glass-header
          ============================================================ */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-50 glass-header"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">

          {/* Bagian kiri: logo dan nama aplikasi */}
          <div className="flex-1 flex items-center justify-start gap-3 font-bold text-xl tracking-tight">
            <LogoResilient />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Resilient</span>
          </div>

          {/* Bagian tengah: tautan navigasi halaman */}
          {/* Menggunakan posisi absolut agar selalu tepat di tengah layar */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 text-sm font-medium">
            <a href="#fitur" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Fitur</a>
            <a href="#keamanan" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Keamanan</a>
            <a href="#harga" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Deployment</a>
          </nav>

          {/* Bagian kanan: tombol tema dan tombol mulai */}
          <div className="flex-1 flex items-center justify-end gap-6">

            {/* Tombol pengganti tema berbentuk kapsul dengan animasi geser */}
            {/* Bola putih bergerak ke kanan saat tema gelap aktif */}
            <button
              onClick={() => setTemaGelap(!temaGelap)}
              className="relative flex items-center bg-slate-200 dark:bg-slate-700 rounded-full w-16 h-8 p-1 transition-colors duration-300 shadow-inner"
              aria-label="Ganti Tema"
            >
              {/* Bola yang bergerak sebagai indikator tema aktif */}
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 ${temaGelap ? 'translate-x-8' : 'translate-x-0'}`}
              />
              {/* Ikon matahari di sisi kiri tombol untuk tema terang */}
              <div className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center pointer-events-none">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              </div>
              {/* Ikon bulan di sisi kanan tombol untuk tema gelap */}
              <div className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center pointer-events-none">
                <Moon className="w-3.5 h-3.5 text-blue-200" />
              </div>
            </button>

            {/* Tautan ke dokumentasi dan tombol mulai sekarang */}
            <div className="hidden sm:flex items-center gap-4">
              <a href="/docs" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1">
                Dokumentasi <ExternalLink className="h-3 w-3" />
              </a>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/20">
                Mulai Sekarang
              </button>
            </div>

          </div>
        </div>
      </motion.header>


      {/* ============================================================
          BAGIAN HERO (PEMBUKA UTAMA)
          Tampilan pertama yang dilihat pengguna saat membuka halaman
          Berisi judul besar, deskripsi singkat, dan tombol tindakan
          ============================================================ */}
      <section className="relative pt-28 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Lencana kecil bertuliskan status rilis terbaru dengan titik berkedip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Resilient versi 1.0 Telah Rilis
          </div>

          {/* Judul utama halaman dengan kata kunci berwarna gradasi */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Observability <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Tanpa Batas</span><br />untuk Institusi Publik.
          </h1>

          {/* Paragraf penjelasan singkat tentang produk */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Platform observability dan pemulihan otomatis yang dirancang khusus untuk puskesmas dan layanan publik. Solusi hemat daya untuk infrastruktur terbatas.
          </p>

          {/* Dua tombol aksi utama: deploy langsung dan baca dokumentasi */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
              Deploy Sekarang <Server className="h-5 w-5" />
            </button>
            <button className="glass-panel text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 px-8 py-4 font-semibold transition flex items-center justify-center gap-2">
              Baca Dokumentasi <FileText className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </section>


      {/* ============================================================
          BAGIAN PRATINJAU DASBOR LANGSUNG
          Menampilkan simulasi tampilan dasbor nyata Resilient
          Berisi status layanan, uptime, notifikasi, dan grafik latensi
          ============================================================ */}
      <section className="py-12 px-6 max-w-7xl mx-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-panel overflow-hidden border border-slate-200 dark:border-white/10"
        >
          {/* Bar atas jendela bergaya macOS dengan tiga lingkaran merah, kuning, hijau */}
          <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-mono ml-4">dasbor-resilient pemantauan-langsung</div>
          </div>

          {/* Konten dasbor: terbagi menjadi panel kiri (status) dan panel kanan (grafik) */}
          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/50 dark:bg-transparent">

            {/* Panel kiri: ringkasan status sistem */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400" /> Ringkasan Sistem
              </h3>

              {/* Kartu status layanan utama: menampilkan kondisi sehat */}
              <div className="glass-panel bg-white/80 dark:bg-slate-800/40 p-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Status Layanan Utama</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-500/20">
                    <CheckCircle className="h-4 w-4" /> Normal dan Sehat
                  </span>
                </div>
              </div>

              {/* Kartu persentase uptime bulan ini */}
              <div className="glass-panel bg-white/80 dark:bg-slate-800/40 p-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Uptime Bulan Ini</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">99.98%</div>
              </div>

              {/* Kartu status koneksi notifikasi Telegram */}
              <div className="glass-panel bg-white/80 dark:bg-slate-800/40 p-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Notifikasi Telegram</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-500/20">
                    <CheckCircle className="h-4 w-4" /> Terhubung
                  </span>
                </div>
              </div>

              {/* Kartu status node: menampilkan peringatan dan node yang mati */}
              <div className="glass-panel bg-white/80 dark:bg-slate-800/40 p-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Node Kesehatan Berjalan</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm font-medium border border-yellow-200 dark:border-yellow-500/20">
                    <AlertTriangle className="h-4 w-4" /> 1 Peringatan
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-500/20">
                    <XCircle className="h-4 w-4" /> 1 Mati
                  </span>
                </div>
              </div>
            </div>

            {/* Panel kanan: grafik latensi jaringan interaktif */}
            {/* Warna garis dan area grafik menyesuaikan tema aktif */}
            <div className="lg:col-span-2 glass-panel bg-white/80 dark:bg-slate-800/40 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800 dark:text-white">
                  <BarChart2 className="h-5 w-5 text-blue-500 dark:text-blue-400" /> Latensi Jaringan (ms)
                </h3>
                <span className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20">Langsung</span>
              </div>

              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataLatensi} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      {/* Definisi gradasi warna area di bawah garis grafik */}
                      <linearGradient id="warnaLatensi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={temaGelap ? '#334155' : '#e2e8f0'} vertical={false} />
                    <XAxis dataKey="waktu" stroke={temaGelap ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={temaGelap ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: temaGelap ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        borderColor: temaGelap ? '#1e293b' : '#e2e8f0',
                        color: temaGelap ? '#f8fafc' : '#0f172a',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '1rem'
                      }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="nilai" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#warnaLatensi)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </motion.div>
      </section>


      {/* ============================================================
          BAGIAN FITUR UNGGULAN
          Menampilkan 4 fitur utama Resilient dalam grid kartu
          Setiap kartu muncul dengan animasi berurutan saat digulir
          ============================================================ */}
      <section id="fitur" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">

          {/* Judul seksi fitur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">Solusi Lengkap Observability</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Pantau dan pulihkan layanan Anda secara otomatis tanpa perlu intervensi manual yang rumit dari tim teknis.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Kartu fitur 1: Pemantauan Uptime */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-14 w-14 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Activity className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pemantauan Uptime</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Pemantauan proaktif setiap detik. Deteksi waktu henti secara instan dengan probe cerdas yang memeriksa kesehatan layanan Anda terus menerus.
              </p>
            </motion.div>

            {/* Kartu fitur 2: Log Terpusat */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-14 w-14 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Log Terpusat</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Kumpulkan dan analisis log dari berbagai sumber di satu tempat. Pencarian log terpusat memudahkan proses perbaikan saat krisis terjadi.
              </p>
            </motion.div>

            {/* Kartu fitur 3: Pemulihan Otomatis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <RefreshCw className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pemulihan Otomatis</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Sistem perbaikan yang beraksi sebelum Anda menyadari ada masalah. Mengembalikan ke versi stabil secara otomatis jika ada masalah baru.
              </p>
            </motion.div>

            {/* Kartu fitur 4: Peringatan Telegram */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-14 w-14 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Bell className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Peringatan Telegram</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Notifikasi krisis seketika melalui aplikasi pesan. Dapatkan peringatan tepat waktu lengkap dengan detail kerusakan sistem.
              </p>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ============================================================
          BAGIAN KEAMANAN MULTI-PENYEWA
          Menjelaskan fitur keamanan berlapis yang melindungi data institusi
          Animasi item bergeser dari kiri secara berurutan
          ============================================================ */}
      <section id="keamanan" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-10 md:p-16 border-t border-white/20"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Keamanan Tingkat Lanjut</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Keamanan operasional institusi Anda adalah prioritas utama. Resilient dibangun dari dasar dengan struktur yang tertutup rapat.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* Item keamanan 1: Isolasi data antar institusi */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-2xl shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Isolasi Data Penuh</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Pemisahan data secara ketat antar institusi. Setiap unit memiliki ruang kerja rahasia yang tidak dapat diakses oleh penyewa lain meskipun berada di server yang sama.</p>
                </div>
              </motion.div>

              {/* Item keamanan 2: Kontrol akses berbasis peran pengguna */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-2xl shrink-0">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Akses Berbasis Peran</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Kontrol otorisasi presisi menggunakan token aman. Tentukan siapa yang bisa melihat log atau mengubah pengaturan dengan peran Admin dan Operator.</p>
                </div>
              </motion.div>

              {/* Item keamanan 3: Kunci API yang bisa dicabut kapan saja */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex gap-6 items-start"
              >
                <div className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-4 rounded-2xl shrink-0">
                  <Key className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Kunci Akses Fleksibel</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Agen tersambung menggunakan kunci unik. Anda dapat mencabut akses secara instan jika mendeteksi keanehan pada server tertentu tanpa mengganggu sistem lainnya.</p>
                </div>
              </motion.div>

              {/* Item keamanan 4: Pembatasan laju permintaan jaringan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex gap-6 items-start"
              >
                <div className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 p-4 rounded-2xl shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Batasan Permintaan Ketat</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Perlindungan terhadap serangan siber atau agen yang tidak normal dengan limitasi laju jaringan secara cerdas, menjaga stabilitas sistem keseluruhan.</p>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </section>


      {/* ============================================================
          BAGIAN INSTALASI AGEN
          Menunjukkan cara memasang agen Resilient menggunakan Docker
          Terdiri dari penjelasan teks di kiri dan kotak kode di kanan
          ============================================================ */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* Kolom kiri: penjelasan manfaat dan tautan dokumentasi */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">Deploy Agen Sangat Cepat</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
              Arsitektur aplikasi ini memungkinkan Anda memantau server terisolasi dengan menggunakan agen ringan berbasis sistem wadah. Tidak butuh pengaturan rumit.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4 bg-white/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Mendukung arsitektur mesin lama dan baru</span>
              </li>
              <li className="flex items-start gap-4 bg-white/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Penggunaan prosesor sangat hemat di bawah 2 persen</span>
              </li>
              <li className="flex items-start gap-4 bg-white/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Komunikasi aman otomatis ke server pusat utama</span>
              </li>
            </ul>
            <a href="/docs/installation" className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-6 py-3 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-500/30 transition">
              Lihat panduan instalasi <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Kolom kanan: pratinjau kode docker-compose dengan tombol salin */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel overflow-hidden border border-slate-300 dark:border-white/10 shadow-2xl"
          >
            {/* Bar atas kotak kode dengan tombol salin */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium text-sm">
                <Terminal className="h-5 w-5 text-blue-500" /> docker-compose.yml
              </div>
              {/* Tombol salin: berubah menjadi centang setelah kode berhasil disalin */}
              <button
                onClick={salinKePapanKlip}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition flex items-center gap-2 text-sm bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm"
              >
                {disalin ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {disalin ? 'Tersalin' : 'Salin Kode'}
              </button>
            </div>

            {/* Isi kode dengan pewarnaan sintaks manual menggunakan span berwarna */}
            <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-300">
              <pre><code>
                <span className="text-purple-600 dark:text-purple-400">version:</span> <span className="text-green-600 dark:text-green-300">{"'3.8'"}</span>
                <span className="text-purple-600 dark:text-purple-400">services:</span>
                <span className="text-blue-600 dark:text-blue-400">resilient-agent:</span>
                <span className="text-slate-500 dark:text-slate-400">image:</span> resilient/agent:latest
                <span className="text-slate-500 dark:text-slate-400">environment:</span>
                - API_KEY=kunci_rahasia_anda
                - SERVER_URL=https://resilient.domain-anda.go.id
                <span className="text-slate-500 dark:text-slate-400">volumes:</span>
                - /var/run/docker.sock:/var/run/docker.sock
                <span className="text-slate-500 dark:text-slate-400">restart:</span> unless-stopped
              </code></pre>
            </div>
          </motion.div>

        </div>
      </section>


      {/* ============================================================
          BAGIAN PILIHAN DEPLOYMENT
          Tiga pilihan cara memasang Resilient sesuai kebutuhan institusi
          Kartu tengah menonjol karena merupakan pilihan yang paling direkomendasikan
          ============================================================ */}
      <section id="harga" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">

          {/* Judul seksi deployment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">Pilihan Deployment Fleksibel</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Pilih lokasi pemasangan yang paling sesuai dengan kondisi jaringan institusi Anda saat ini.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Kartu pilihan 1: untuk uji coba di komputer lokal */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-panel p-8 border border-slate-200 dark:border-white/10 flex flex-col"
            >
              <h3 className="text-xl font-bold mb-2">Uji Coba Lokal</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Sangat cocok untuk belajar dan evaluasi di komputer Anda sendiri.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Database Ringan Lokal
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Agen Tunggal Sederhana
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">Lihat Panduan Dasar</button>
            </motion.div>

            {/* Kartu pilihan 2: pilihan utama untuk server di dalam jaringan institusi */}
            {/* Kartu ini sengaja dinaikkan sedikit agar menonjol dibanding kartu lainnya */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel p-8 border-2 border-blue-500 dark:border-blue-400 shadow-2xl relative transform md:-translate-y-4 flex flex-col bg-white/90 dark:bg-slate-800/80"
            >
              {/* Lencana rekomendasi di atas tengah kartu */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                Pilihan Utama
              </div>
              <h3 className="text-xl font-bold mb-2 mt-2">Server Institusi</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Paling ideal untuk Dinas Kesehatan menjaga data tetap di dalam wilayah.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Jaringan Internal Tertutup
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Skala Menengah Besar
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Fitur Notifikasi Penuh
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-lg shadow-blue-500/30">Panduan Produksi</button>
            </motion.div>

            {/* Kartu pilihan 3: untuk server di awan publik seperti VPS atau cloud */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-panel p-8 border border-slate-200 dark:border-white/10 flex flex-col"
            >
              <h3 className="text-xl font-bold mb-2">Server Awan Publik</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Untuk akses luas dari internet dan skalabilitas tanpa batas fisik.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Kinerja Super Cepat
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Dukungan Domain Aman
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle className="h-5 w-5 text-blue-500" /> Skala Ratusan Node
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Panduan Awan</button>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ============================================================
          FOOTER (KAKI HALAMAN)
          Berisi logo, hak cipta, dan tautan tambahan
          Muncul secara perlahan saat digulir ke paling bawah
          ============================================================ */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 glass-header border-t border-slate-200 dark:border-white/10 mt-12 py-10"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Logo dan nama produk */}
          <div className="flex items-center gap-3 font-bold text-lg">
            <LogoResilient />
            <span className="text-slate-900 dark:text-white">Resilient</span>
          </div>

          {/* Teks hak cipta */}
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            &copy; 2026 Tim Pengembang Resilient. Seluruh hak dilindungi.
          </div>

          {/* Tautan navigasi footer */}
          <div className="flex gap-8 text-sm font-semibold">
            <a href="/docs" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Dokumentasi</a>
            <a href="/bantuan" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Pusat Bantuan</a>
          </div>

        </div>
      </motion.footer>

    </div>
  );
}
