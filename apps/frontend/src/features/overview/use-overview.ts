"use client";

import { useCallback, useEffect, useState } from "react";
import { overviewApi, OverviewApiError } from "./overview-api";
import type {
  HealthCheckPoint,
  IncidentItem,
  OverviewMetrics,
  ServiceItem,
} from "./types";

interface OverviewState {
  metrics: OverviewMetrics | null;
  services: ServiceItem[];
  selectedServiceId: number | null;
  healthChecks: HealthCheckPoint[];
  incidents: IncidentItem[];
  isLoading: boolean;
  isChartLoading: boolean;
  error: string | null;
  isUnauthorized: boolean;
}

// Menyusun daftar insiden terbaru dari catatan pemeriksaan yang gagal (status "down").
function buildIncidents(
  service: ServiceItem | undefined,
  checks: HealthCheckPoint[]
): IncidentItem[] {
  if (!service) return [];
  const downPoints = checks
    .filter((point) => point.status.toLowerCase() === "down")
    .slice(-6)
    .reverse();

  return downPoints.map((point, index) => ({
    id: `${service.id}-${point.time}-${index}`,
    serviceId: service.id,
    serviceName: service.name,
    time: point.time,
    responseTimeMs: point.response_time_ms,
    note: `Layanan tidak merespons (${point.response_time_ms} ms)`,
  }));
}

export function useOverview(token: string | null) {
  const [state, setState] = useState<OverviewState>({
    metrics: null,
    services: [],
    selectedServiceId: null,
    healthChecks: [],
    incidents: [],
    isLoading: true,
    isChartLoading: false,
    error: null,
    isUnauthorized: false,
  });

  const loadAll = useCallback(
    async (preferredServiceId?: number | null) => {
      if (!token) return;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isUnauthorized: false,
      }));

      try {
        const [metrics, services] = await Promise.all([
          overviewApi.getOverview(token),
          overviewApi.getServices(token),
        ]);

        const activeService =
          services.find((item) => item.id === preferredServiceId) ??
          services[0];

        let checks: HealthCheckPoint[] = [];
        if (activeService) {
          checks = await overviewApi.getServiceHealthChecks(
            token,
            activeService.id,
            "24h"
          );
        }

        setState({
          metrics,
          services,
          selectedServiceId: activeService ? activeService.id : null,
          healthChecks: checks,
          incidents: buildIncidents(activeService, checks),
          isLoading: false,
          isChartLoading: false,
          error: null,
          isUnauthorized: false,
        });
      } catch (err) {
        const isUnauthorized =
          err instanceof OverviewApiError && err.status === 401;
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data ringkasan.";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isChartLoading: false,
          error: message,
          isUnauthorized,
        }));
      }
    },
    [token]
  );

  // Memuat ulang hanya data grafik saat pengguna mengganti layanan di dropdown.
  const selectService = useCallback(
    async (serviceId: number) => {
      if (!token) return;

      setState((prev) => ({
        ...prev,
        selectedServiceId: serviceId,
        isChartLoading: true,
      }));

      try {
        const checks = await overviewApi.getServiceHealthChecks(
          token,
          serviceId,
          "24h"
        );
        setState((prev) => {
          const target = prev.services.find((item) => item.id === serviceId);
          return {
            ...prev,
            healthChecks: checks,
            incidents: buildIncidents(target, checks),
            isChartLoading: false,
          };
        });
      } catch (err) {
        const isUnauthorized =
          err instanceof OverviewApiError && err.status === 401;
        setState((prev) => ({
          ...prev,
          isChartLoading: false,
          isUnauthorized,
        }));
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    async function init() {
      if (!active) return;
      await loadAll(null);
    }

    void init();

    return () => {
      active = false;
    };
  }, [token, loadAll]);

  const refresh = useCallback(() => {
    void loadAll(state.selectedServiceId);
  }, [loadAll, state.selectedServiceId]);

  return {
    ...state,
    refresh,
    selectService,
  };
}