import type { ReactNode } from "react";
// Font dimuat dari paket npm lokal agar build tetap jalan tanpa internet.
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource/instrument-serif";
import "@/features/overview/dashboard-tokens.css";
import "@/features/overview/dashboard.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}