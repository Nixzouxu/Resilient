# Dokumentasi Proyek Antarmuka Resilient

Dokumentasi ini dibuat untuk membantu seluruh pengembang dalam memahami struktur dan fungsi dari setiap berkas utama yang ada di proyek ini. Semua kode telah dirancang menggunakan pendekatan modern, bersih, dan mudah dibaca.

## Struktur Berkas Utama

### 1. src/app/globals.css
Berkas ini adalah pondasi gaya tampilan (styling) untuk seluruh aplikasi.
- **Fungsi Utama:** Menyimpan variabel warna dan konfigurasi efek visual (seperti efek kaca atau Glassmorphism).
- **Cara Memahami:** 
  - Bagian atas mendefinisikan variabel untuk tema terang.
  - Bagian dengan awalan titik dark (`.dark`) mendefinisikan variabel untuk tema gelap.
  - Terdapat kelas khusus seperti `glass-panel` yang bisa langsung dipanggil di komponen React untuk membuat efek kotak kaca transparan secara instan.
  - Kami juga menambahkan efek cahaya melingkar (`bg-glow-1` dan `bg-glow-2`) yang hanya muncul saat tema gelap aktif untuk memberikan kesan modern.

### 2. src/app/layout.tsx
Berkas ini adalah pembungkus utama (wrapper) dari seluruh halaman web.
- **Fungsi Utama:** Mengatur struktur dasar HTML, bahasa, pengaturan SEO sederhana (metadata), dan memuat jenis huruf (font) standar aplikasi.
- **Cara Memahami:** 
  - Perhatikan bagian `Inter` yang diimpor dari Google Fonts, ini memastikan seluruh aplikasi menggunakan satu standar huruf yang konsisten.
  - Komponen `RootLayout` membungkus seluruh anak halaman (children) di dalam tag `body` yang sudah diberikan gaya dasar.

### 3. src/app/page.tsx
Berkas ini adalah halaman pendaratan (landing page) utama yang dilihat oleh pengguna.
- **Fungsi Utama:** Menampilkan informasi produk Resilient, grafik interaktif, fitur, dan cara instalasi.
- **Cara Memahami:**
  - **Pengaturan Mode Gelap:** Kami menggunakan fungsi bawaan React yaitu `useState` dan `useEffect`. Saat tombol pengganti tema diklik, kode akan secara otomatis menambahkan atau menghapus kelas `dark` pada elemen dasar web.
  - **Logo Kustom:** Komponen `LogoResilient` adalah gambar vektor murni yang ringan dan dapat berubah warna secara otomatis sesuai tema.
  - **Efek Animasi:** Menggunakan pustaka `framer-motion` (komponen `motion.div`) agar setiap kotak muncul dengan mulus saat halaman digulir.
  - **Grafik:** Menggunakan pustaka `recharts` untuk membuat simulasi grafik latensi jaringan secara interaktif. Warna grafik akan otomatis menyesuaikan diri (terang atau gelap) berdasarkan tema aktif.
  - **Komentar:** Seluruh kode di dalam berkas ini telah ditandai dengan penjelasan bahasa Indonesia yang sangat jelas pada setiap bagiannya (seperti Bagian Header, Fitur Unggulan, dan Bagian Keamanan).

## Panduan Cepat untuk Pengembang Baru

1. Jika Anda ingin mengubah warna utama, ubah pada berkas `globals.css`.
2. Jika Anda ingin mengganti teks, menambah tombol, atau mengubah struktur tata letak halaman utama, silakan edit berkas `page.tsx`.
3. Gunakan kelas bawaan dari Tailwind CSS untuk mempermudah pengaturan jarak dan posisi tanpa harus menulis CSS manual.
4. Jaga agar setiap penambahan kode tetap menyertakan penjelasan yang rapi dan mudah dibaca.
