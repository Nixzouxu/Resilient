import { FormEvent } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { CardFrame } from "./card-frame";
import { LoginFieldErrors } from "./types";

// Presenter kartu Masuk: hanya menampilkan data dari props dan memanggil
// fungsi dari props. Tidak ada pemanggilan API atau logika di sini.
interface LoginCardProps {
  isActive: boolean;
  email: string;
  password: string;
  showPassword: boolean;
  fieldErrors: LoginFieldErrors;
  error: string | null;
  notice: string | null;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoRegister: () => void;
  onGoForgot: () => void;
}

export function LoginCard(props: LoginCardProps) {
  const { fieldErrors, error, notice, isLoading, showPassword } = props;

  return (
    <CardFrame titleId="auth-title-login" isActive={props.isActive}>
      <BrandMark />
      <h2 id="auth-title-login" className="auth-title">Masuk ke Resilient</h2>
      <p className="auth-lead">Pantau semua service institusimu dari satu tempat.</p>

      {/* noValidate: validasi dilakukan hook agar pesannya berbahasa Indonesia */}
      <form onSubmit={props.onSubmit} noValidate className="auth-form">
        {notice && (
          <div role="status" className="auth-alert" data-tone="ok">
            <CircleCheck size={16} aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}
        {error && (
          // role="alert" membuat pembaca layar langsung membacakan pesan ini.
          // Ikon dan teks dipakai bersama warna, supaya tidak hanya mengandalkan warna.
          <div role="alert" className="auth-alert" data-tone="error">
            <CircleAlert size={16} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">Email</label>
          <input
            id="login-email"
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="nama@institusi.id"
            value={props.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            disabled={isLoading}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          />
          {fieldErrors.email && <p id="login-email-error" className="auth-error">{fieldErrors.email}</p>}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="login-password" className="auth-label">Password</label>
            <button type="button" className="auth-link" onClick={props.onGoForgot}>
              Lupa password?
            </button>
          </div>
          <div className="auth-input-wrap">
            <input
              id="login-password"
              className="auth-input auth-input-padded"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan password"
              value={props.password}
              onChange={(e) => props.onPasswordChange(e.target.value)}
              disabled={isLoading}
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={props.onToggleShowPassword}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.password && <p id="login-password-error" className="auth-error">{fieldErrors.password}</p>}
        </div>

        <button type="submit" className="auth-btn" disabled={isLoading}>
          {isLoading && <LoaderCircle size={16} className="auth-spin" aria-hidden="true" />}
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="auth-foot">
        Belum punya akun?{" "}
        <button type="button" className="auth-link" onClick={props.onGoRegister}>Daftar</button>
      </p>
    </CardFrame>
  );
}