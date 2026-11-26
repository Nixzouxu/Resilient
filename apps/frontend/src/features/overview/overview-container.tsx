"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { OctagonAlert, RotateCw } from "lucide-react";
import { useTheme } from "@/features/auth/use-theme";
import { DashboardShell } from "./dashboard-shell";
import { IncidentTimeline } from "./incident-timeline";
import { LatencyChart } from "./latency-chart";
import { OverviewBanner } from "./overview-banner";
import { ScrollReveal } from "./scroll-reveal";
import { ServiceTable } from "./service-table";
import { SummaryCards } from "./summary-cards";
import { useAuthSession } from "./use-auth-session";
import { useOverview } from "./use-overview";

export function OverviewContainer() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isReady, token, user, logout } = useAuthSession();
  const overview = useOverview(isReady ? token : null);

  // Pelindung rute: pengguna tanpa token atau dengan sesi kadaluarsa dialihkan ke /login.
  useEffect(() => {
    if (!isReady) return;
    if (!token || overview.isUnauthorized) {
      if (overview.isUnauthorized) {
        logout();
      }
      router.replace("/login");
    }
  }, [isReady, token, overview.isUnauthorized, logout, router]);

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Tampilkan layar tunggu singkat sampai pengecekan sesi di browser selesai.
  if (!isReady || !token) {
    return (
      <div
        className="rs-dash flex min-h-screen items-center justify-center p-6"
        data-theme={theme}
      >
        <p className="text-sm" style={{ color: "var(--rs-text-2)" }}>
          Memeriksa sesi masuk...
        </p>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <DashboardShell
        title="Ringkasan"
        theme={theme}
        onToggleTheme={handleToggleTheme}
        user={user}
        onLogout={handleLogout}
      >
        {overview.error ? (
          <section
            role="alert"
            className="rs-dash-card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                style={{
                  backgroundColor: "var(--rs-bad-soft)",
                  borderColor: "var(--rs-bad-soft)",
                  color: "var(--rs-bad)",
                }}
              >
                <OctagonAlert className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--rs-text-1)" }}
                >
                  Gagal memuat data ringkasan
                </h2>
                <p className="mt-1 text-xs" style={{ color: "var(--rs-text-2)" }}>
                  {overview.error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={overview.refresh}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
              style={{
                backgroundColor: "var(--rs-accent)",
                color: "var(--rs-on-accent)",
              }}
            >
              <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              Coba lagi
            </button>
          </section>
        ) : overview.isLoading || !overview.metrics ? (
          <div className="space-y-4" aria-busy="true">
            <div className="rs-dash-card h-44 animate-pulse" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rs-dash-card h-32 animate-pulse" />
              <div className="rs-dash-card h-32 animate-pulse" />
              <div className="rs-dash-card h-32 animate-pulse" />
              <div className="rs-dash-card h-32 animate-pulse" />
            </div>
            <div className="rs-dash-card h-72 animate-pulse" />
          </div>
        ) : (
          <>
            <ScrollReveal y={14}>
              <OverviewBanner
                metrics={overview.metrics}
                isRefreshing={overview.isLoading}
                onRefresh={overview.refresh}
              />
            </ScrollReveal>

            <SummaryCards metrics={overview.metrics} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ScrollReveal delay={0.05} className="lg:col-span-2">
                <LatencyChart
                  services={overview.services}
                  selectedServiceId={overview.selectedServiceId}
                  healthChecks={overview.healthChecks}
                  isLoading={overview.isChartLoading}
                  onSelectService={overview.selectService}
                />
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <IncidentTimeline incidents={overview.incidents} />
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.06}>
              <ServiceTable
                services={overview.services}
                selectedServiceId={overview.selectedServiceId}
                onSelectService={overview.selectService}
              />
            </ScrollReveal>
          </>
        )}
      </DashboardShell>
    </MotionConfig>
  );
}