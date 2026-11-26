import { BrandMark } from "./brand-mark";
import { CardFrame } from "./card-frame";

interface ForgotCardProps {
  isActive: boolean;
  onGoLogin: () => void;
}

// Kartu Lupa password. Backend belum punya endpoint reset password, jadi kartu
// ini jujur menjelaskan keadaannya dan tidak berpura-pura mengirim email.
// Kalau endpoint-nya sudah ada, ganti isi kartu ini dengan form email.
export function ForgotCard({ isActive, onGoLogin }: ForgotCardProps) {
  return (
    <CardFrame titleId="auth-title-forgot" isActive={isActive}>
      <BrandMark />
      <h2 id="auth-title-forgot" className="auth-title">Lupa password</h2>
      <p className="auth-lead">Reset password lewat email belum tersedia di versi ini.</p>

      <p className="auth-body">
        Hubungi admin Resilient untuk mengatur ulang password akunmu. Kalau ternyata kamu
        sudah ingat, kembali ke halaman masuk dan coba lagi.
      </p>

      <button type="button" className="auth-btn" onClick={onGoLogin}>
        Kembali ke masuk
      </button>
    </CardFrame>
  );
}