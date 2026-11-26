"use client";

import { ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import { AUTH_ORDER, AuthView } from "./auth-view";
import { useIsWide } from "./use-is-wide";

const noopSubscribe = () => () => {};

interface AuthStageProps {
  view: AuthView;
  onSelect: (view: AuthView) => void;
  cards: Record<AuthView, ReactNode>;
}

// Panggung tiga kartu. Komponen ini hanya menentukan "jarak" tiap kartu dari
// kartu aktif lewat atribut data-offset. Seluruh gerakannya (posisi, skala,
// kemiringan, transparansi) ada di auth.css dan dijalankan oleh CSS.
//
// Kenapa CSS, bukan JavaScript: animasi CSS yang hanya mengubah transform dan
// opacity dikerjakan oleh GPU, terpisah dari JavaScript. Jadi tetap mulus
// walaupun halaman sedang sibuk, misalnya saat mode development.
export function AuthStage({ view, onSelect, cards }: AuthStageProps) {
  const wide = useIsWide();
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

  const activeIndex = AUTH_ORDER.indexOf(view);

  return (
    <div className="auth-stage" data-wide={wide} ref={stageRef}>
      {mounted &&
        AUTH_ORDER.map((id, index) => {
          // 0 = di tengah, -1 = satu langkah ke kiri, 1 = satu langkah ke kanan, dst.
          const offset = index - activeIndex;
          const isActive = offset === 0;

          return (
            <div
              key={id}
              className="auth-slot"
              data-offset={offset}
              // Mengklik kartu samping membawanya ke tengah. Ini kemudahan untuk
              // mouse saja, pengguna keyboard memakai tombol "Daftar" atau "Lupa password?".
              onClick={isActive ? undefined : () => onSelect(id)}
            >
              {/* inert: kartu yang tidak aktif tidak bisa difokus atau dibaca pembaca layar */}
              <div className="auth-slot-inner" inert={!isActive} aria-hidden={!isActive}>
                {cards[id]}
              </div>
            </div>
          );
        })}
    </div>
  );
}