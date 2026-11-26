"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "resilient_theme";
const listeners = new Set<() => void>();

// Tema disimpan di localStorage lalu dibaca lewat useSyncExternalStore.
// Cara ini dipilih supaya tidak perlu setState di dalam useEffect, dan
// tidak ada peringatan hydration saat server dan browser berbeda pendapat.
function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage bisa diblokir (mode privat). Pakai tema bawaan.
  }
  return "dark";
}

// Server tidak tahu pilihan pengguna, jadi memakai tema bawaan (gelap).
function getServerSnapshot(): Theme {
  return "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setTheme(next: Theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Gagal menyimpan tidak apa-apa, tema tetap berubah sampai halaman ditutup.
    }
    listeners.forEach((listener) => listener());
  }

  return { theme, setTheme };
}