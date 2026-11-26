import { ReactNode } from "react";

// Bingkai yang sama untuk ketiga kartu. Empat titik di sudut meniru
// penanda registrasi pada desain referensi.
export function CardFrame({
  titleId,
  isActive,
  children,
}: {
  titleId: string;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <section className="auth-card" data-active={isActive} aria-labelledby={titleId}>
      <span className="auth-mark auth-mark-tl" aria-hidden="true" />
      <span className="auth-mark auth-mark-tr" aria-hidden="true" />
      <span className="auth-mark auth-mark-bl" aria-hidden="true" />
      <span className="auth-mark auth-mark-br" aria-hidden="true" />
      {children}
    </section>
  );
}