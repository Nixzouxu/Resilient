"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { sessionStore } from "@/features/auth/session-store";
import type { AuthUser } from "@/features/auth/types";

const SESSION_EVENT = "resilient-session-change";
const USER_KEY = "resilient_user";

function emptySubscribe() {
  return () => {};
}

function subscribeSession(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SESSION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SESSION_EVENT, onStoreChange);
  };
}

function getUserRawSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_KEY);
}

// Mengambil status sesi login di sisi klien tanpa memicu setState di useEffect.
export function useAuthSession() {
  const isReady = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const token = useSyncExternalStore(
    subscribeSession,
    () => sessionStore.getToken(),
    () => null
  );

  const userRaw = useSyncExternalStore(
    subscribeSession,
    getUserRawSnapshot,
    () => null
  );

  const user = useMemo<AuthUser | null>(() => {
    if (!userRaw) return null;
    try {
      return JSON.parse(userRaw) as AuthUser;
    } catch {
      return null;
    }
  }, [userRaw]);

  const logout = useCallback(() => {
    sessionStore.clear();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(SESSION_EVENT));
    }
  }, []);

  return { isReady, token, user, logout };
}