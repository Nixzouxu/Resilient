import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
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
// layoutId membuat bulatan penanda "meluncur" dari satu sisi ke sisi lain.
export function ThemeSwitch({ theme, onChange }: ThemeSwitchProps) {
  return (
    <div className="auth-switch" role="group" aria-label="Tema tampilan">
      {OPTIONS.map(({ value, label, Icon }) => {
        const isOn = theme === value;
        return (
          <button
            key={value}
            type="button"
            className="auth-switch-btn"
            aria-pressed={isOn}
            aria-label={label}
            onClick={() => onChange(value)}
          >
            {isOn && (
              <motion.span
                layoutId="auth-theme-thumb"
                className="auth-switch-thumb"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className="auth-switch-icon" size={16} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}