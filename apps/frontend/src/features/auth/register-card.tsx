import { FormEvent } from "react";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { CardFrame } from "./card-frame";
import { RegisterFieldErrors } from "./types";

// Presenter kartu Daftar. Sama seperti kartu Masuk: murni tampilan.
interface RegisterCardProps {
  isActive: boolean;
  tenantName: string;
  name: string;
  email: string;
  password: string;
  showPassword: boolean;
  fieldErrors: RegisterFieldErrors;
  error: string | null;
  isLoading: boolean;
  onTenantNameChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoLogin: () => void;
}

export function RegisterCard(props: RegisterCardProps) {
  const { fieldErrors, error, isLoading, showPassword } = props;

  return (
    <CardFrame titleId="auth-title-register" isActive={props.isActive}>
      <BrandMark />
      <h2 id="auth-title-register" className="auth-title">Buat akun Resilient</h2>
      <p className="auth-lead">Daftarkan institusimu, lalu mulai pantau service-nya.</p>

      <form onSubmit={props.onSubmit} noValidate className="auth-form">
        {error && (
          <div role="alert" className="auth-alert" data-tone="error">
            <CircleAlert size={16} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="register-tenant" className="auth-label">Nama institusi</label>
          <input
            id="register-tenant"
            className="auth-input"
            type="text"
            autoComplete="organization"
            placeholder="Puskesmas Kota Sehat"
            value={props.tenantName}
            onChange={(e) => props.onTenantNameChange(e.target.value)}
            disabled={isLoading}
            aria-invalid={fieldErrors.tenantName ? true : undefined}
            aria-describedby={fieldErrors.tenantName ? "register-tenant-error" : undefined}
          />
          {fieldErrors.tenantName && <p id="register-tenant-error" className="auth-error">{fieldErrors.tenantName}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="register-name" className="auth-label">Nama lengkap</label>
          <input
            id="register-name"
            className="auth-input"
            type="text"
            autoComplete="name"
            placeholder="Boleh dikosongkan"
            value={props.name}
            onChange={(e) => props.onNameChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-email" className="auth-label">Email</label>
          <input
            id="register-email"
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="nama@institusi.id"
            value={props.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            disabled={isLoading}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
          />
          {fieldErrors.email && <p id="register-email-error" className="auth-error">{fieldErrors.email}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="register-password" className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <input
              id="register-password"
              className="auth-input auth-input-padded"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              value={props.password}
              onChange={(e) => props.onPasswordChange(e.target.value)}
              disabled={isLoading}
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
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
          {fieldErrors.password && <p id="register-password-error" className="auth-error">{fieldErrors.password}</p>}
        </div>

        <button type="submit" className="auth-btn" disabled={isLoading}>
          {isLoading && <LoaderCircle size={16} className="auth-spin" aria-hidden="true" />}
          {isLoading ? "Membuat akun..." : "Buat akun"}
        </button>
      </form>

      <p className="auth-foot">
        Sudah punya akun?{" "}
        <button type="button" className="auth-link" onClick={props.onGoLogin}>Masuk</button>
      </p>
    </CardFrame>
  );
}