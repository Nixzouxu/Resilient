// Baris ini yang bikin Node.js baca file .env dan menaruh isinya
// ke process.env, harus di baris paling atas sebelum dipakai di bawah.
import "dotenv/config";

export const config = {
  // process.env.RESILIENT_API_KEY ambil nilai dari file .env.
  // "?? """ artinya kalau nilainya tidak ada (undefined), pakai string kosong
  // sebagai cadangan, supaya program tidak langsung error di baris ini.
  apiKey: process.env.RESILIENT_API_KEY ?? "",
  backendUrl: process.env.RESILIENT_BACKEND_URL ?? "http://localhost:3001",
};

// Validasi sederhana: kalau API key kosong, langsung hentikan program
// dengan pesan yang jelas, daripada agent jalan diam-diam tapi gagal
// terus setiap kirim data karena tidak punya kunci akses yang valid.
if (!config.apiKey) {
  console.error("RESILIENT_API_KEY belum diset di .env");
  process.exit(1);
}