"use client";

import { useState } from "react";
import { AuthShell } from "./auth-shell";
import { AuthStage } from "./auth-stage";
import { AuthView } from "./auth-view";
import { ForgotCard } from "./forgot-card";
import { LoginCard } from "./login-card";
import { RegisterCard } from "./register-card";
import { ThemeSwitch } from "./theme-switch";
import { useLogin } from "./use-login";
import { useRegister } from "./use-register";
import { useTheme } from "./use-theme";

// Container: menyambung semua hook (logika) dengan semua kartu (tampilan).
// Komponen ini sengaja tidak punya gaya, tugasnya hanya mengoper data dan fungsi.
export function AuthContainer() {
  const [view, setView] = useState<AuthView>("login");
  const [notice, setNotice] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const login = useLogin();

  // Setelah daftar berhasil: isi email di kartu Masuk lalu pindah ke sana.
  const register = useRegister((email) => {
    login.setEmail(email);
    setNotice("Akun berhasil dibuat. Silakan masuk.");
    setView("login");
  });

  function goTo(next: AuthView) {
    // Pesan "akun berhasil dibuat" hanya relevan sekali, hilangkan saat pindah.
    if (next !== "login") setNotice(null);
    setView(next);
  }

  return (
    <AuthShell theme={theme}>
      <AuthStage
        view={view}
        onSelect={goTo}
        cards={{
          register: (
            <RegisterCard
              isActive={view === "register"}
              tenantName={register.tenantName}
              name={register.name}
              email={register.email}
              password={register.password}
              showPassword={register.showPassword}
              fieldErrors={register.fieldErrors}
              error={register.error}
              isLoading={register.isLoading}
              onTenantNameChange={register.setTenantName}
              onNameChange={register.setName}
              onEmailChange={register.setEmail}
              onPasswordChange={register.setPassword}
              onToggleShowPassword={register.toggleShowPassword}
              onSubmit={register.handleSubmit}
              onGoLogin={() => goTo("login")}
            />
          ),
          login: (
            <LoginCard
              isActive={view === "login"}
              email={login.email}
              password={login.password}
              showPassword={login.showPassword}
              fieldErrors={login.fieldErrors}
              error={login.error}
              notice={notice}
              isLoading={login.isLoading}
              onEmailChange={login.setEmail}
              onPasswordChange={login.setPassword}
              onToggleShowPassword={login.toggleShowPassword}
              onSubmit={login.handleSubmit}
              onGoRegister={() => goTo("register")}
              onGoForgot={() => goTo("forgot")}
            />
          ),
          forgot: <ForgotCard isActive={view === "forgot"} onGoLogin={() => goTo("login")} />,
        }}
      />
      <ThemeSwitch theme={theme} onChange={setTheme} />
    </AuthShell>
  );
}