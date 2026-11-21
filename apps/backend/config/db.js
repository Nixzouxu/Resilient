const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const rootEnvPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
} else {
  require('dotenv').config();
}

// Pool untuk tabel relasional (tenants, users, services)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Pool koneksi TimescaleDB
const timescalePool = new Pool({
  connectionString: process.env.TIMESCALEDB_URL || process.env.DATABASE_URL,
});

const activeDbUrl = process.env.TIMESCALEDB_URL || process.env.DATABASE_URL;
console.log('Cek URL DB:', activeDbUrl);

// Fungsi Setup Hypertable TimescaleDB (SCRUM-75)
const setupTimescaleDB = async (retries = 5, delayMs = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await timescalePool.query(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

      await timescalePool.query(`
        CREATE TABLE IF NOT EXISTS health_checks (
          time TIMESTAMPTZ NOT NULL,
          service_id INT NOT NULL,
          tenant_id INT NOT NULL,
          status VARCHAR(50) NOT NULL,
          response_time_ms INT NOT NULL
        );
      `);

      await timescalePool.query(`
        SELECT create_hypertable('health_checks', 'time', if_not_exists => TRUE);
      `);

      console.log('TimescaleDB Hypertable berhasil dikonfigurasi.');
      return;
    } catch (err) {
      console.error(`Gagal merancang TimescaleDB hypertable (percobaan ${attempt}/${retries}):`, err.message || err);
      if (attempt === retries) return;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

module.exports = { pgPool, timescalePool, setupTimescaleDB };