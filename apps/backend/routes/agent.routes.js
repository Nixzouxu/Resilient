const express = require('express');
const router = express.Router();
const { pgPool, timescalePool } = require('../config/db');
const authenticateApiKey = require('../middleware/apiKey.middleware');

// Gunakan API Key Guard untuk SEMUA rute di file ini
router.use(authenticateApiKey);

// 1. GET /agent/services - Agent meminta daftar service yang harus dipantau
router.get('/agent/services', async (req, res) => {
    try {
        const result = await pgPool.query(
            'SELECT id, name, type, endpoint_url, container_name, check_interval, status, consecutive_failures, last_checked_at FROM services WHERE tenant_id = $1 ORDER BY id ASC',
            [req.tenantId]
        );
        res.json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil data service untuk agent.' });
    }
});

// 2. POST /health-checks/ingest - Agent mengirim data hasil pantauan
router.post('/health-checks/ingest', async (req, res) => {
    const { serviceId, status, responseTimeMs } = req.body;
    const tenantId = req.tenantId;

    if (!serviceId || !status || responseTimeMs === undefined) {
        return res.status(400).json({ message: 'Payload tidak lengkap.' });
    }

    try {
        // A. Cek apakah serviceId benar-benar milik suki tersebut
        const serviceRes = await pgPool.query(
            'SELECT * FROM services WHERE id = $1 AND tenant_id = $2',
            [serviceId, tenantId]
        );
        if (serviceRes.rows.length === 0) {
            return res.status(403).json({ message: 'Service tidak valid atau bukan milik tenant ini.' });
        }

        const service = serviceRes.rows[0];
        const normalizedInputStatus = String(status).toLowerCase();
        if (!['up', 'down'].includes(normalizedInputStatus)) {
            return res.status(400).json({ message: 'Status harus bernilai "up" atau "down".' });
        }

        // B. Insert ke TimescaleDB (Time-series)
        await timescalePool.query(
            `INSERT INTO health_checks (time, service_id, tenant_id, status, response_time_ms)
       VALUES (NOW(), $1, $2, $3, $4)`,
            [serviceId, tenantId, normalizedInputStatus, responseTimeMs]
        );

        // C. Evaluasi threshold (3x down berturut-turut) & normalisasi status (HEALTHY | UNHEALTHY | UNKNOWN) udah difix ya masseh
        let newFailures = service.consecutive_failures ?? 0;
        let newStatus = ['HEALTHY', 'UNHEALTHY', 'UNKNOWN'].includes(service.status)
            ? service.status
            : 'UNKNOWN';

        if (normalizedInputStatus === 'down') {
            newFailures += 1;
            if (newFailures >= 3) {
                newStatus = 'UNHEALTHY';
            }
        } else if (normalizedInputStatus === 'up') {
            newFailures = 0;
            newStatus = 'HEALTHY';
        }

        // D. Update status, consecutive_failures, dan last_checked_at (scoped per tenant_id)
        await pgPool.query(
            `UPDATE services
       SET consecutive_failures = $1,
           status = $2,
           last_checked_at = NOW()
       WHERE id = $3 AND tenant_id = $4`,
            [newFailures, newStatus, serviceId, tenantId]
        );

        res.json({
            message: 'Ingest health check berhasil.',
            current_status: newStatus,
            consecutive_failures: newFailures,
            last_checked_at: new Date().toISOString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat ingest data.' });
    }
});

module.exports = router;