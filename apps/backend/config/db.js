const path = require('path');
// 1. Cukup panggil dotenv SATU KALI dengan path yang benar
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

// Pool koneksi TimescaleDB
const timescalePool = new Pool({
  connectionString: process.env.TIMESCALEDB_URL || process.env.DATABASE_URL,
});
console.log("Cek URL DB:", process.env.TIMESCALEDB_URL);
// Fungsi Setup Hypertable TimescaleDB (SCRUM-75)
const setupTimescaleDB = async () => {
  try {
    // 2. WAJIB: Aktifkan ekstensi timescaledb sebelum membuat hypertable
    await timescalePool.query(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

    // Buat tabel standar untuk health_checks
    await timescalePool.query(`
      CREATE TABLE IF NOT EXISTS health_checks (
        time TIMESTAMPTZ NOT NULL,
        service_id INT NOT NULL,
        tenant_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        response_time_ms INT NOT NULL
      );
    `);

    // Ubah tabel jadi Hypertable berbasis kolom 'time'
    await timescalePool.query(`
      SELECT create_hypertable('health_checks', 'time', if_not_exists => TRUE);
    `);

    console.log('TimescaleDB Hypertable berhasil dikonfigurasi.');
  } catch (err) {
    console.error('Gagal merancang TimescaleDB hypertable:', err);
  }
};

module.exports = { timescalePool, setupTimescaleDB };