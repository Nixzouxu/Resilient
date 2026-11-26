import { Moon, Sun } from "lucide-react";
import { Theme } from "./use-theme";

interface ThemeSwitchProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

const OPTIONS = [
  { value: "dark" as const, label: "Tema gelap", Icon: Moon },
  { value: "light" as const, label: "Tema terang", Icon: Sun },
];

// Tombol ganti tema di bawah kartu. Dua tombol biasa dengan aria-pressed,
// jadi bisa dipakai dengan keyboard (Tab lalu Enter atau Spasi).
// Bulatan penanda tetap satu elemen yang meluncur lewat CSS (lihat auth.css),
// posisinya mengikuti atribut data-theme-value.
export function ThemeSwitch({ theme, onChange }: ThemeSwitchProps) {
  return (
    <div className="auth-switch" role="group" aria-label="Tema tampilan" data-theme-value={theme}>
      <span className="auth-switch-thumb" aria-hidden="true" />
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className="auth-switch-btn"
          aria-pressed={theme === value}
          aria-label={label}
          onClick={() => onChange(value)}
        >
          <Icon className="auth-switch-icon" size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}