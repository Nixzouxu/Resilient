"use client";

import { useSyncExternalStore } from "react";

// Di layar lebar ketiga kartu terlihat berdampingan. Di layar sempit
// (ponsel) hanya kartu aktif yang terlihat, supaya tidak berdesakan.
const QUERY = "(min-width: 900px)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useIsWide(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}