// Tiga lempeng isometrik = tiga lapis sistem Resilient.
// Lempeng paling atas memuat logo. Saat halaman digulir, lempeng terpisah (efek "exploded view").
const PLATES = [
  { cy: 112, label: "Agent", note: "memeriksa layanan" },
  { cy: 216, label: "Backend", note: "menilai dan mengingatkan" },
  { cy: 320, label: "Database", note: "menyimpan riwayat" },
];
const CX = 190, W = 165, H = 82, T = 14;

export function LayerStack() {
  return (
    <svg viewBox="0 0 580 420" role="img" aria-label="Tiga lapis sistem Resilient: agent, backend, dan database" className="rs-stack mx-auto h-auto w-full max-w-[540px]">
      <defs>
        <linearGradient id="rs-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f8cff" /><stop offset="0.55" stopColor="#8b7bf7" /><stop offset="1" stopColor="#b57bf0" />
        </linearGradient>
      </defs>
      {PLATES.map((p, i) => {
        const top = `${CX},${p.cy - H} ${CX + W},${p.cy} ${CX},${p.cy + H} ${CX - W},${p.cy}`;
        const left = `${CX - W},${p.cy} ${CX},${p.cy + H} ${CX},${p.cy + H + T} ${CX - W},${p.cy + T}`;
        const right = `${CX + W},${p.cy} ${CX},${p.cy + H} ${CX},${p.cy + H + T} ${CX + W},${p.cy + T}`;
        return (
          <g key={p.label} className={`rs-split rs-split-${i}`}>
            <g className="rs-plate rs-in">
              <polygon points={left} fill="var(--rs-surface-2)" stroke="var(--rs-line-strong)" />
              <polygon points={right} fill="var(--rs-surface-2)" stroke="var(--rs-line-strong)" />
              <polygon points={top} fill="var(--rs-surface)" stroke={i === 0 ? "url(#rs-edge)" : "var(--rs-line-strong)"} strokeWidth={i === 0 ? 2 : 1} />
              {i === 0 && <image href="/brand/logo.png" x={CX - 46} y={p.cy - 58} width="92" height="92" />}
              <line x1={CX + W + 10} y1={p.cy + T / 2} x2={CX + W + 44} y2={p.cy + T / 2} stroke="var(--rs-line-strong)" />
              <text x={CX + W + 54} y={p.cy + 2} fill="var(--rs-text-1)" fontSize="15" fontWeight="600">{p.label}</text>
              <text x={CX + W + 54} y={p.cy + 20} fill="var(--rs-text-3)" fontSize="12">{p.note}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}