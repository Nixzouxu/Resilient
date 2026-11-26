"use client";

import { ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AUTH_ORDER, AuthView } from "./auth-view";
import { useIsWide } from "./use-is-wide";

// Jarak geser kartu samping dari tengah (px). Lebar kartu 400px, jadi
// kartu samping tertutup sebagian oleh kartu tengah, seperti tumpukan.
const SIDE = 372;

// Keadaan awal saat halaman dibuka: ketiga kartu menumpuk di tengah, lalu
// terbuka bersamaan ke posisinya masing-masing.
const ENTER = { x: 0, y: 28, scale: 0.88, rotateY: 0, opacity: 0, filter: "blur(10px)" };

// Tujuan animasi tiap kartu, ditentukan oleh jaraknya dari kartu aktif.
// offset 0 = di tengah, -1 = satu langkah ke kiri, +1 = satu langkah ke kanan.
function slotState(offset: number, wide: boolean) {
  if (offset === 0) {
    return { x: 0, y: 0, scale: 1, rotateY: 0, opacity: 1, filter: "blur(0px)" };
  }
  const dir = Math.sign(offset);
  // Layar sempit: kartu lain disembunyikan, kartu aktif saja yang tampil.
  if (!wide) {
    return { x: dir * 40, y: 0, scale: 0.96, rotateY: 0, opacity: 0, filter: "blur(6px)" };
  }
  if (Math.abs(offset) === 1) {
    return { x: dir * SIDE, y: 0, scale: 0.9, rotateY: dir * -16, opacity: 0.55, filter: "blur(1.5px)" };
  }
  // Dua langkah dari tengah: menjauh dan memudar, siap masuk saat diputar.
  return { x: dir * SIDE * 1.7, y: 0, scale: 0.8, rotateY: dir * -22, opacity: 0, filter: "blur(4px)" };
}

const noopSubscribe = () => () => {};

interface AuthStageProps {
  view: AuthView;
  onSelect: (view: AuthView) => void;
  cards: Record<AuthView, ReactNode>;
}

// Panggung tiga kartu. Komponen ini hanya mengatur posisi dan gerak,
// isi kartunya dikirim dari luar lewat props "cards".
export function AuthStage({ view, onSelect, cards }: AuthStageProps) {
  const wide = useIsWide();
  const reduceMotion = useReducedMotion();
  // Kartu baru digambar setelah halaman siap di browser. Dengan begitu
  // animasi pembuka langsung memakai ukuran layar yang benar.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const stageRef = useRef<HTMLDivElement>(null);
  const previousView = useRef(view);

  // Setelah pindah kartu, fokus keyboard dipindah ke isian pertama kartu baru,
  // supaya pengguna keyboard dan pembaca layar tidak tertinggal di kartu lama.
  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    const timer = window.setTimeout(() => {
      stageRef.current
        ?.querySelector<HTMLElement>('[data-active="true"] input, [data-active="true"] button')
        ?.focus({ preventScroll: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [view]);

  // Pegas dipakai agar gerak terasa halus dan punya bobot, bukan kaku.
  // Opacity dan blur memakai durasi tetap supaya tidak "memantul".
  const transition = reduceMotion
    ? { duration: 0.01 }
    : {
        default: { type: "spring" as const, stiffness: 110, damping: 21, mass: 1 },
        opacity: { duration: 0.55 },
        filter: { duration: 0.55 },
      };

  const activeIndex = AUTH_ORDER.indexOf(view);

  return (
    <div className="auth-stage" ref={stageRef}>
      {mounted &&
        AUTH_ORDER.map((id, index) => {
          const offset = index - activeIndex;
          const isActive = offset === 0;
          const isVisibleSide = wide && Math.abs(offset) === 1;

          return (
            <motion.div
              key={id}
              className="auth-slot"
              data-side={isVisibleSide}
              initial={reduceMotion ? false : ENTER}
              animate={slotState(offset, wide)}
              transition={transition}
              style={{
                zIndex: 3 - Math.min(Math.abs(offset), 2),
                pointerEvents: isActive || isVisibleSide ? "auto" : "none",
              }}
              // Mengklik kartu samping membawanya ke tengah. Ini kemudahan untuk
              // mouse saja, pengguna keyboard memakai tombol "Daftar" atau "Lupa password?".
              onClick={isActive ? undefined : () => onSelect(id)}
            >
              {/* inert: kartu yang tidak aktif tidak bisa difokus atau dibaca pembaca layar */}
              <div className="auth-slot-inner" inert={!isActive} aria-hidden={!isActive}>
                {cards[id]}
              </div>
            </motion.div>
          );
        })}
    </div>
  );
}