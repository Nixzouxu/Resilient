import Image from "next/image";

interface LogoProps {
  size?: number;
  withText?: boolean;
  priority?: boolean;
  className?: string;
}

// Satu-satunya tempat logo dipakai. Kalau logo diganti lagi,
// cukup ubah file /public/brand/logo.png, tidak perlu mengedit banyak halaman.
export function Logo({ size = 32, withText = false, priority = false, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/logo.png"
        // Kalau ada teks di sampingnya, teks itu sudah menyebut nama produk
        alt={withText ? "" : "Resilient"}
        width={size}
        height={size}
        priority={priority}
      />
      {withText && (
        <span className="font-semibold tracking-tight" style={{ color: "var(--rs-text-1)" }}>
          Resilient
        </span>
      )}
    </span>
  );
}