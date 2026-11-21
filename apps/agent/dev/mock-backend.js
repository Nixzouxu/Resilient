// Server tiruan HANYA untuk development: dipakai untuk mengetes agent
// tanpa menunggu backend asli. Jangan dipakai di production.
//
// Cara pakai: node apps/agent/dev/mock-backend.js
// Meniru dua hal sekaligus:
//   1. Backend  -> GET /agent/agent/services dan POST /agent/health-checks/ingest
//   2. Service yang dipantau -> GET /health (bisa dimatikan) dan GET /health-stabil
// Kontrol dari browser atau Invoke-RestMethod:
//   /mode/down   /mode/up   /tambah-service   /hapus-service

const http = require("http");

const PORT = 3099;
const API_KEY_BENAR = process.env.MOCK_API_KEY || "benar";

let sehat = true;
// Daftar service tiruan, bentuknya sama dengan balasan backend asli.
let services = [
  { id: 1, type: "http", endpoint_url: `http://localhost:${PORT}/health`, container_name: null, check_interval: 5 },
];

function cekApiKey(req, res) {
  const key = req.headers["x-api-key"];
  if (!key) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Header X-API-KEY wajib disertakan." }));
    return false;
  }
  if (key !== API_KEY_BENAR) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: "API Key tidak valid." }));
    return false;
  }
  return true;
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Service tiruan yang bisa dimatikan.
  if (req.method === "GET" && req.url === "/health") {
    res.statusCode = sehat ? 200 : 503;
    return res.end(sehat ? "ok" : "down");
  }
  if (req.method === "GET" && req.url === "/health-stabil") return res.end("ok");

  // Tombol kontrol.
  if (req.url === "/mode/down") { sehat = false; return res.end("service 1 sekarang DOWN"); }
  if (req.url === "/mode/up") { sehat = true; return res.end("service 1 sekarang UP"); }
  if (req.url === "/tambah-service") {
    if (!services.find((s) => s.id === 2)) {
      services.push({ id: 2, type: "http", endpoint_url: `http://localhost:${PORT}/health-stabil`, container_name: null, check_interval: 5 });
    }
    return res.end("service 2 ditambahkan");
  }
  if (req.url === "/hapus-service") {
    services = services.filter((s) => s.id !== 2);
    return res.end("service 2 dihapus");
  }

  // Backend tiruan: daftar service (path berulang, sama seperti backend asli).
  if (req.method === "GET" && req.url === "/agent/agent/services") {
    if (!cekApiKey(req, res)) return;
    return res.end(JSON.stringify({ data: services }));
  }

  // Backend tiruan: terima hasil health check.
  if (req.method === "POST" && req.url === "/agent/health-checks/ingest") {
    let body = "";
    req.on("data", (p) => (body += p));
    req.on("end", () => {
      if (!cekApiKey(req, res)) return;
      console.log("Terima health check:", body);
      res.statusCode = 200;
      res.end(JSON.stringify({ message: "Ingest health check berhasil." }));
    });
    return;
  }

  res.statusCode = 404;
  res.end();
});

server.listen(PORT, () => {
  console.log(`Mock backend jalan di http://localhost:${PORT} (API key benar: "${API_KEY_BENAR}")`);
});