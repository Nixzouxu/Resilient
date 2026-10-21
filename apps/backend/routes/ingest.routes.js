const express = require('express');
const router = express.Router();
const { pgPool, timescalePool } = require('../config/db');
const authenticateApiKey = require('../middleware/apiKey.middleware');

// POST /health-check - Ditembak oleh Agent dengan header X-API-KEY
router.post('/health-check', authenticateApiKey, async (req, res) => {
  const { service_id, status, response_time_ms } = req.body;
  const tenantId = req.tenantId;

  if (!service_id || !status || response_time_ms === undefined) {
    return res.status(400).json({ message: 'Payload tidak lengkap.' });
  }

  try {
    // 1. Simpan time-series log ke TimescaleDB
    await timescalePool.query(
      `INSERT INTO health_checks (time, service_id, tenant_id, status, response_time_ms)
       VALUES (NOW(), $1, $2, $3, $4)`,
      [service_id, tenantId, status, response_time_ms]
    );

    // 2. Evaluasi threshold 3x gagal berturut-turut
    const serviceRes = await pgPool.query('SELECT * FROM services WHERE id = $1 AND tenant_id = $2', [service_id, tenantId]);
    if (serviceRes.rows.length === 0) {
      return res.status(404).json({ message: 'Service tidak terdaftar.' });
    }

    const service = serviceRes.rows[0];
    let newFailures = service.consecutive_failures;
    let newStatus = service.status;

    if (status.toUpperCase() === 'DOWN') {
      newFailures += 1;
      if (newFailures >= 3) {
        newStatus = 'UNHEALTHY'; // Ditandai UNHEALTHY setelah 3x gagal berturut-turut
      }
    } else {
      newFailures = 0;
      newStatus = 'HEALTHY';
    }

    // Update status service terkini di PostgreSQL
    await pgPool.query(
      'UPDATE services SET consecutive_failures = $1, status = $2 WHERE id = $3',
      [newFailures, newStatus, service_id]
    );

    res.json({
      message: 'Ingest health check berhasil.',
      current_status: newStatus,
      consecutive_failures: newFailures
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memproses ingest health check.' });
  }
});

module.exports = router;