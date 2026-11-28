"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/features/auth/use-theme";
import { COMPOSE_TEXT } from "./landing-data";
import { LandingView } from "./landing-view";
import { useLandingMotion } from "./use-landing-motion";

// Container: mengurus tema, salin kode, dan animasi. Tampilan ada di LandingView.
export function LandingContainer() {
  const { theme, setTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useLandingMotion(rootRef);

  // Halaman lama (misalnya 404) masih memakai kelas "dark" di <html>,
  // jadi kelas itu tetap diselaraskan dengan pilihan tema yang sama
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleCopy = () => {
    navigator.clipboard.writeText(COMPOSE_TEXT).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <LandingView
      rootRef={rootRef}
      theme={theme}
      onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      copied={copied}
      onCopy={handleCopy}
    />
  );
}