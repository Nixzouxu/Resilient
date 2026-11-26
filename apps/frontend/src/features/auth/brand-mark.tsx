// Logo Resilient: cincin dengan garis denyut di tengahnya.
// Garis denyut sesuai tugas produk ini (memantau "detak" service).
// Animasi menggambarnya diatur di auth.css dan hanya jalan saat kartu aktif.
export function BrandMark() {
  return (
    <svg className="auth-brand" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="20.5" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <path
        className="auth-pulse"
        d="M9 23 H16.5 L19.5 15 L24.5 31 L27.5 23 H35"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
      />
    </svg>
  );
}