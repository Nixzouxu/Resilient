// Halaman utama (server). Font dan gaya landing dimuat di sini supaya hanya terpakai di rute "/".
import "@fontsource-variable/schibsted-grotesk/index.css";
import "@fontsource/instrument-serif/index.css";
import "@/features/landing/landing-tokens.css";
import "@/features/landing/landing.css";
import { LandingContainer } from "@/features/landing/landing-container";

export default function HomePage() {
  return <LandingContainer />;
}