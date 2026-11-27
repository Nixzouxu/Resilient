import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Server,
  Settings,
  Sun,
} from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import type { Theme } from "@/features/auth/use-theme";
import { ScrollProgressBar } from "./scroll-reveal";

interface DashboardShellProps {
  title: string;
  theme: Theme;
  onToggleTheme: () => void;
  user: AuthUser | null;
  onLogout: () => void;
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  active?: boolean;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "Layanan", href: "#tabel-layanan", icon: Server },
  { label: "Peringatan", href: "#", icon: Bell, disabled: true },
  { label: "Log", href: "#", icon: FileText, disabled: true },
  { label: "Setelan", href: "#", icon: Settings, disabled: true },
];

export function DashboardShell({
  title,
  theme,
  onToggleTheme,
  user,
  onLogout,
  children,
}: DashboardShellProps) {
  const displayName = user?.name?.trim() || user?.email || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="rs-dash flex min-h-screen flex-col lg:flex-row" data-theme={theme}>
      {/* Sidebar kiri untuk layar lebar */}
      <aside
        className="hidden shrink-0 flex-col justify-between border-r p-4 lg:flex"
        style={{
          width: "var(--rs-sidebar-w)",
          backgroundColor: "var(--rs-surface-side)",
          borderColor: "var(--rs-line)",
        }}
      >
        <div>
          <Link
            href="/dashboard"
            className="mb-6 flex items-center gap-2.5 rounded-xl px-2 py-1.5"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--rs-accent-soft)",
                color: "var(--rs-accent)",
              }}
            >
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p
                className="text-base font-semibold leading-tight"
                style={{ color: "var(--rs-text-1)" }}
              >
                Resilient
              </p>
              <p className="text-xs" style={{ color: "var(--rs-text-3)" }}>
                Pantau Layanan
              </p>
            </div>
          </Link>

          <nav aria-label="Navigasi utama" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm opacity-60"
                    style={{ color: "var(--rs-text-3)" }}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </span>
                    <span className="text-[11px]">Segera</span>
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: item.active
                      ? "var(--rs-accent-soft)"
                      : "transparent",
                    color: item.active ? "var(--rs-accent)" : "var(--rs-text-2)",
                  }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          className="rounded-xl border p-3 text-xs"
          style={{
            backgroundColor: "var(--rs-surface-inset)",
            borderColor: "var(--rs-line)",
            color: "var(--rs-text-3)",
          }}
        >
          <p className="font-medium" style={{ color: "var(--rs-text-2)" }}>
            Tenant #{user?.tenant_id ?? "-"}
          </p>
          <p className="mt-0.5 truncate">{user?.email ?? "Akun aktif"}</p>
        </div>
      </aside>

      {/* Area kanan: topbar dan konten utama */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header
          className="sticky top-0 z-20 flex items-center justify-between border-b px-4 backdrop-blur-md lg:px-6"
          style={{
            height: "var(--rs-topbar-h)",
            backgroundColor:
              theme === "dark"
                ? "rgba(8, 11, 26, 0.85)"
                : "rgba(242, 244, 251, 0.88)",
            borderColor: "var(--rs-line)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg lg:hidden"
              style={{
                backgroundColor: "var(--rs-accent-soft)",
                color: "var(--rs-accent)",
              }}
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--rs-text-1)" }}
            >
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === "dark"
                  ? "Ganti ke tema terang"
                  : "Ganti ke tema gelap"
              }
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
              style={{
                backgroundColor: "var(--rs-surface)",
                borderColor: "var(--rs-line)",
                color: "var(--rs-text-2)",
              }}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Terang</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Gelap</span>
                </>
              )}
            </button>

            <div
              className="hidden items-center gap-2 rounded-xl border px-3 py-1.5 sm:flex"
              style={{
                backgroundColor: "var(--rs-surface)",
                borderColor: "var(--rs-line)",
              }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "var(--rs-accent-soft)",
                  color: "var(--rs-accent)",
                }}
              >
                {initial}
              </span>
              <span
                className="max-w-[140px] truncate text-xs font-medium"
                style={{ color: "var(--rs-text-1)" }}
              >
                {displayName}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
              style={{
                backgroundColor: "var(--rs-surface)",
                borderColor: "var(--rs-line)",
                color: "var(--rs-text-2)",
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>

          <ScrollProgressBar />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Bilah navigasi bawah khusus layar ponsel */}
      <nav
        aria-label="Navigasi ponsel"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-2 py-2 lg:hidden"
        style={{
          backgroundColor: "var(--rs-surface-side)",
          borderColor: "var(--rs-line)",
        }}
      >
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          if (item.disabled) {
            return (
              <span
                key={item.label}
                aria-disabled="true"
                className="flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] opacity-50"
                style={{ color: "var(--rs-text-3)" }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </span>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium"
              style={{
                color: item.active ? "var(--rs-accent)" : "var(--rs-text-2)",
              }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}