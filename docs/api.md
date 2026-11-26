# Laporan Progres Backend & Kontrak API — Resilient (Sprint 1 – Sprint 2)

**Branch Aktif:** `feat_ingest-healthcheck/21-10-2026` (HEAD: `dccf94a`)  
**Base URL (Docker Compose):** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api-docs`

---

## 1. Ringkasan Seluruh Pekerjaan Backend (Sprint 1 – Sprint 2)

1. **Infrastruktur Database, Docker & Startup Resilience (`6d28a33`):**
   - Konfigurasi dual pool (`pgPool` untuk data relasional dan `timescalePool` untuk data *time-series*) dengan mekanisme *retry* inisialisasi *hypertable* `health_checks` agar backend tidak *crash* (`ECONNREFUSED`) saat container PostgreSQL/TimescaleDB masih booting.
   - Skema awal `tenants`, `users`, `services`, dan *hypertable* `health_checks` pada `init-db/02-schema.sql`.
   - Transaksi atomik (`BEGIN` / `COMMIT` / `ROLLBACK`) pada `POST /auth/register` dengan penanganan email duplikat (`409 Conflict`).

2. **Multi-Tenant Row-Level Filtering & Health-Check Ingest (`4500cf8`):**
   - Isolasi data ketat berbasis `tenant_id` pada seluruh query `SELECT`, `INSERT`, `UPDATE`, dan `DELETE`.
   - Validasi kepemilikan `serviceId` terhadap `tenantId` milik `X-API-KEY` pada endpoint *ingest* (`403 Forbidden` jika lintas-tenant).
   - Evaluasi *threshold* kegagalan: `3x down` berturut-turut mengubah status service menjadi `UNHEALTHY`; status `up` mereset `consecutive_failures` ke `0` dan mengubah status menjadi `HEALTHY`.

3. **Keamanan Rate Limiting & Fondasi OOP Alerting (`841748e`, `3cb940d`):**
   - Pemasangan `express-rate-limit` pada endpoint sensitif (`POST /auth/login` dan `POST /agent/health-checks/ingest`) sesuai `NFR-6.2`.
   - Implementasi struktur OOP `NotificationService` (`BaseNotifier` -> `TelegramNotifier`) dengan *cooldown* anti-spam. *(Catatan: endpoint `POST /alerts/telegram/connect` untuk menghubungkan `chat_id` tenant belum dibuat dan dijadwalkan berikutnya).*

4. **Penyelesaian Temuan Audit A1–A4 (`71d9305`):**
   - **A1 (Standarisasi Status):** Nilai status service disepakati dan diseragamkan menjadi **`HEALTHY`**, **`UNHEALTHY`**, dan **`UNKNOWN`** (dengan default `'UNKNOWN'` di `init-db/02-schema.sql`).
   - **A2 (`last_checked_at`):** Setiap `POST /agent/health-checks/ingest` kini mengisi `last_checked_at = NOW()` pada tabel `services`.
   - **A3 (`JWT_SECRET` Fail-Fast):** Nilai cadangan `'dev-secret-change-in-production'` telah dihapus. Backend langsung menghentikan proses saat startup jika `JWT_SECRET` kosong/tidak terbaca.
   - **A4 (Log & Swagger):** Pencetakan `DATABASE_URL` yang memuat kredensial ke console log sudah dihapus, serta dokumentasi endpoint di Swagger (`b851696`) telah diperbarui.

5. **Endpoint Baru Sprint 2 (`71d9305`, `dccf94a`):**
   - `PATCH /services/:id` untuk pembaruan konfigurasi service milik tenant.
   - `GET /services/:id/health-checks?range=24h|7d|30d` untuk grafik riwayat pada halaman *Service Detail*.
   - `GET /overview` untuk ringkasan metrik pada halaman *Overview*.

---

## 2. Catatan Penting untuk DevOps & Integrasi Frontend

1. **Environment Variables Wajib (`docker-compose.yml` & CI):**
   - `JWT_SECRET`: **Wajib terisi** di file `.env` (maupun *secrets* GitHub Actions saat menjalankan test/build backend). Jika kosong, aplikasi sengaja gagal saat startup.
   - `DATABASE_URL`: `postgresql://resilient:resilient@postgres:5432/resilient` (untuk jaringan internal Docker).
   - `PORT`: `"3001"` di Docker Compose (fallback lokal `5000` jika dijalankan di luar Docker tanpa env `PORT`).
2. **Migrasi Skema pada Volume Docker Lama:**
   - Karena PostgreSQL hanya menjalankan `./init-db` saat volume `pgdata` masih kosong, jika environment lokal sudah punya volume `pgdata` dari Sprint 1, jalankan `docker compose down -v` sebelum `docker compose up --build`, atau jalankan query penyesuaian manual:
     ```sql
     ALTER TABLE services ALTER COLUMN status SET DEFAULT 'UNKNOWN';
     UPDATE services SET status = UPPER(status) WHERE status IN ('unknown', 'healthy', 'unhealthy');
     ```
3. **CORS:**
   - Middleware `cors()` sudah aktif di `app.js`, sehingga frontend Next.js dapat langsung memanggil `http://localhost:3001`.
4. **Klarifikasi Singkat untuk Frontend:**
   - Pada `GET /overview`, field `uptime_24h_pct` akan bernilai `null` jika tenant belum memiliki data *health check* dalam 24 jam terakhir (agar UI bisa menampilkan `-` atau `N/A` alih-alih angka `100%` semu).
   - Pada `GET /overview`, `incidents_this_week` saat ini dihitung dari jumlah catatan `down` pada `health_checks` dalam 7 hari terakhir (sebelum tabel khusus `incidents` diaktifkan di fase berikutnya).

---

## 3. Kontrak API Lengkap (`docs/api.md`)

### Autentikasi & Format Error Standar
- **JWT User/Dashboard:** Header `Authorization: Bearer <token>` (membawa `userId`, `tenantId`, `role`).
- **Agent Monitoring:** Header `X-API-KEY: rsl_<hex>` (unik per tenant).
- **Format Error Standar:**
  ```json
  {
    "message": "Penjelasan singkat error"
  }
  ```
  - `400 Bad Request`: Payload tidak lengkap / parameter `range` atau `id` tidak valid.
  - `401 Unauthorized`: Token JWT atau header `X-API-KEY` tidak disertakan / tidak valid.
  - `403 Forbidden`: Agent mencoba mengakses atau mengirim data untuk `serviceId` milik tenant lain.
  - `404 Not Found`: Resource tidak ditemukan atau bukan milik `tenant_id` yang login.
  - `409 Conflict`: Email sudah terdaftar saat registrasi.
  - `429 Too Many Requests`: Melebihi batas *rate limiter* pada login atau ingest.

---

### A. Auth (`/auth`)

#### 1. `POST /auth/register`
Mendaftarkan tenant baru sekaligus akun user `admin` pertama dalam satu transaksi atomik.
- **Auth:** Publik
- **Request Body:**
  ```json
  {
    "tenant_name": "Gampong Lamteh",
    "name": "Admin Lamteh",
    "email": "admin@lamteh.id",
    "password": "password123"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "Registrasi tenant berhasil.",
    "tenant": {
      "id": 1,
      "name": "Gampong Lamteh",
      "api_key": "rsl_a1b2c3d4e5f6..."
    },
    "user": {
      "id": 1,
      "name": "Admin Lamteh",
      "email": "admin@lamteh.id",
      "role": "admin",
      "tenant_id": 1
    }
  }
  ```

#### 2. `POST /auth/login`
- **Auth:** Publik *(dilindungi rate limiter login)*
- **Request Body:**
  ```json
  {
    "email": "admin@lamteh.id",
    "password": "password123"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login berhasil.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin Lamteh",
      "email": "admin@lamteh.id",
      "role": "admin",
      "tenant_id": 1
    }
  }
  ```

---

### B. Services (`/services`)

#### 1. `GET /services`
Mengambil seluruh service milik tenant yang sedang login.
- **Auth:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "tenant_id": 1,
        "name": "Portal Desa",
        "type": "HTTP",
        "endpoint_url": "http://localhost:8080/health",
        "container_name": "portal_desa",
        "check_interval": 30,
        "status": "HEALTHY",
        "consecutive_failures": 0,
        "last_checked_at": "2026-11-25T13:00:00.000Z",
        "created_at": "2026-11-25T12:00:00.000Z"
      }
    ]
  }
  ```

#### 2. `POST /services`
Menambahkan service baru untuk dipantau.
- **Auth:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Portal Desa",
    "type": "HTTP",
    "endpoint_url": "http://localhost:8080/health",
    "container_name": "portal_desa",
    "check_interval": 30
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "Service berhasil ditambahkan.",
    "data": {
      "id": 1,
      "tenant_id": 1,
      "name": "Portal Desa",
      "type": "HTTP",
      "endpoint_url": "http://localhost:8080/health",
      "container_name": "portal_desa",
      "check_interval": 30,
      "status": "UNKNOWN",
      "consecutive_failures": 0,
      "last_checked_at": null,
      "created_at": "2026-11-25T12:00:00.000Z"
    }
  }
  ```

#### 3. `PATCH /services/:id`
Mengubah konfigurasi service milik tenant sendiri. Field yang diizinkan: `name`, `type`, `endpoint_url`, `container_name`, `check_interval`.
- **Auth:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Portal Desa Utama",
    "check_interval": 60
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Service berhasil diperbarui.",
    "data": {
      "id": 1,
      "tenant_id": 1,
      "name": "Portal Desa Utama",
      "type": "HTTP",
      "endpoint_url": "http://localhost:8080/health",
      "container_name": "portal_desa",
      "check_interval": 60,
      "status": "HEALTHY",
      "consecutive_failures": 0,
      "last_checked_at": "2026-11-25T13:00:00.000Z",
      "created_at": "2026-11-25T12:00:00.000Z"
    }
  }
  ```

#### 4. `DELETE /services/:id`
Menghapus service milik tenant sendiri.
- **Auth:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
  ```json
  {
    "message": "Service berhasil dihapus."
  }
  ```

#### 5. `GET /services/:id/health-checks?range=24h`
Mengambil riwayat pemeriksaan *time-series* dari TimescaleDB urut waktu naik (`ASC`) untuk chart *Service Detail*.
- **Auth:** `Authorization: Bearer <token>`
- **Query Parameter:** `range` = `24h` (default) | `7d` | `30d`
- **Response (`200 OK`):**
  ```json
  {
    "service_id": 1,
    "range": "24h",
    "data": [
      {
        "time": "2026-11-25T12:55:00.000Z",
        "status": "up",
        "response_time_ms": 118
      },
      {
        "time": "2026-11-25T13:00:00.000Z",
        "status": "down",
        "response_time_ms": 1520
      }
    ]
  }
  ```

---

### C. Overview (`/overview`)

#### 1. `GET /overview`
Mengambil ringkasan metrik tenant untuk halaman utama *Overview*.
- **Auth:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
  ```json
  {
    "data": {
      "total_services": 3,
      "down_services": 1,
      "uptime_24h_pct": 96.5,
      "incidents_this_week": 2,
      "overall_status": "DEGRADED"
    }
  }
  ```
  - `overall_status`: `UNKNOWN` (jika `total_services === 0`), `DEGRADED` (jika `down_services > 0`), atau `HEALTHY`.

---

### D. Agent & Ingest (`/agent`)

#### 1. `GET /agent/services`
Mengambil daftar service yang harus dipantau oleh agent milik tenant terkait.
- **Auth:** `X-API-KEY: rsl_<hex>`
- **Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "Portal Desa Utama",
        "type": "HTTP",
        "endpoint_url": "http://localhost:8080/health",
        "container_name": "portal_desa",
        "check_interval": 30,
        "status": "HEALTHY",
        "consecutive_failures": 0,
        "last_checked_at": "2026-11-25T13:00:00.000Z"
      }
    ]
  }
  ```

#### 2. `POST /agent/health-checks/ingest`
Menerima hasil pengecekan dari agent, menyimpannya ke TimescaleDB, mengevaluasi threshold `3x down`, dan memperbarui `last_checked_at`.
- **Auth:** `X-API-KEY: rsl_<hex>` *(dilindungi rate limiter ingest)*
- **Request Body:**
  ```json
  {
    "serviceId": 1,
    "status": "DOWN",
    "responseTimeMs": 150
  }
  ```
  *(Nilai `status` menerima `"up"` / `"down"` case-insensitive).*
- **Response (`200 OK`):**
  ```json
  {
    "message": "Ingest health check berhasil.",
    "current_status": "UNHEALTHY",
    "consecutive_failures": 3,
    "last_checked_at": "2026-11-25T13:05:00.000Z"
  }
  ```

---

## 4. Antrean Pekerjaan Backend Berikutnya
1. Endpoint `POST /alerts/telegram/connect` + integrasi `NotificationService` saat status service berubah menjadi `UNHEALTHY`.
2. Tabel `incidents` khusus untuk pencatatan insiden terstruktur (`started_at`, `resolved_at`, `status`).
3. Uji isolasi multi-tenant dan latensi deteksi sesuai rencana pengujian SRS.