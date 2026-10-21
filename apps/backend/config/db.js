const { Pool } = require('pg');
require('dotenv').config();

// Pool koneksi TimescaleDB
const timescalePool = new Pool({
  connectionString: process.env.TIMESCALEDB_URL || process.env.DATABASE_URL,
});

// Fungsi Setup Hypertable TimescaleDB (SCRUM-75)
const setupTimescaleDB = async () => {
  try {
    // 1. Buat tabel standar untuk health_checks
    await timescalePool.query(`
      CREATE TABLE IF NOT EXISTS health_checks (
        time TIMESTAMPTZ NOT NULL,
        service_id INT NOT NULL,
        tenant_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        response_time_ms INT NOT NULL
      );
    `);

    // 2. Ubah tabel menjadi Hypertable berbasis kolom 'time'
    await timescalePool.query(`
      SELECT create_hypertable('health_checks', 'time', if_not_exists => TRUE);
    `);

    console.log('✅ TimescaleDB Hypertable (health_checks) berhasil dikonfigurasi.');
  } catch (err) {
    console.error('❌ Gagal merancang TimescaleDB hypertable:', err.message);
  }
};

module.exports = { timescalePool, setupTimescaleDB };