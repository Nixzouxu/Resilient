// File ini adalah pembungkus utama seluruh halaman aplikasi Next.js
// Setiap halaman baru akan secara otomatis dibungkus oleh komponen ini

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Mendaftarkan font Inter dari Google Fonts
// Font ini akan tersedia di seluruh halaman melalui variabel CSS
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Informasi metadata halaman untuk keperluan SEO dan tab browser
export const metadata: Metadata = {
  title: 'Resilient - Platform Observability Self-Hosted',
  description: 'Platform observability dan auto-recovery self-hosted untuk institusi publik.',
};

// Komponen tata letak utama yang membungkus seluruh halaman
// children adalah isi halaman yang sedang dikunjungi pengguna
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
