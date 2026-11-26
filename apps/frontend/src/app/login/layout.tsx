import type { ReactNode } from "react";
// Font dipasang dari paket npm (bukan dari Google Fonts), jadi tidak butuh
// koneksi saat build. Hanya dimuat untuk halaman /login.
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource/instrument-serif";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}