"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Semua animasi landing ada di sini. Aturan: hanya transform dan opacity,
// dan semuanya dibungkus matchMedia supaya pengguna yang mematikan animasi
// langsung melihat halaman statis yang utuh.
export function useLandingMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const coarse = window.matchMedia("(pointer: coarse)").matches;

        // 1. Pembuka: judul naik dari balik topeng, lalu isi lain menyusul
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(".rs-nav", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.7 })
          .fromTo(".rs-hero-line > span", { yPercent: 110, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.1)
          .fromTo(".rs-hero-fade", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.5)
          .fromTo(".rs-plate", { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.16, ease: "power4.out" }, 0.3);

        // 2. Tumpukan lempeng melayang pelan, dan terpisah saat halaman digulir
        gsap.to(".rs-stack", { y: -8, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
        const split = { trigger: ".rs-hero", start: "top top", end: "bottom 30%", scrub: 0.6 };
        gsap.to(".rs-split-0", { y: -34, scrollTrigger: split });
        gsap.to(".rs-split-2", { y: 34, scrollTrigger: split });
        gsap.to(".rs-glow", { yPercent: 28, ease: "none", scrollTrigger: { ...split, end: "bottom top" } });

        // 3. Kalimat pernyataan menyala kata demi kata mengikuti gulir
        gsap.to(".rs-word", {
          opacity: 1, ease: "none", stagger: 0.12,
          scrollTrigger: { trigger: ".rs-statement", start: "top 78%", end: "bottom 48%", scrub: true },
        });

        // 4. Elemen lain muncul bergantian saat masuk layar
        ScrollTrigger.batch(".rs-reveal", {
          start: "top 88%", once: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", overwrite: true }),
        });
        ScrollTrigger.batch(".rs-col-line", {
          start: "top 90%", once: true,
          onEnter: (els) => gsap.fromTo(els, { scaleY: 0, opacity: 1 }, { scaleY: 1, opacity: 1, duration: 1.1, stagger: 0.12, ease: "power2.out" }),
        });

        // 5. Kartu paket: miring tiga dimensi halus dan cahaya mengikuti kursor (tidak untuk layar sentuh)
        const cleanups: Array<() => void> = [];
        if (!coarse) {
          gsap.utils.toArray<HTMLElement>(".rs-plan").forEach((card) => {
            gsap.set(card, { transformPerspective: 900 });
            const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
            const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
            const move = (e: PointerEvent) => {
              const r = card.getBoundingClientRect();
              const px = (e.clientX - r.left) / r.width;
              const py = (e.clientY - r.top) / r.height;
              ry((px - 0.5) * 8);
              rx((0.5 - py) * 8);
              card.style.setProperty("--mx", `${px * 100}%`);
              card.style.setProperty("--my", `${py * 100}%`);
            };
            const leave = () => { rx(0); ry(0); };
            card.addEventListener("pointermove", move);
            card.addEventListener("pointerleave", leave);
            cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); });
          });
        }
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope }
  );
}