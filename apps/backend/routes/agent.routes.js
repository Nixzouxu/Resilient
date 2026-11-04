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
            'SELECT id, type, endpoint_url, container_name, check_interval FROM services WHERE tenant_id = $1',
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
        // A. Cek apakah serviceId benar-benar milik tenant tersebut
        const serviceRes = await pgPool.query('SELECT * FROM services WHERE id = $1 AND tenant_id = $2', [serviceId, tenantId]);
        if (serviceRes.rows.length === 0) {
            return res.status(403).json({ message: 'Service tidak valid atau bukan milik tenant ini.' });
        }

        const service = serviceRes.rows[0];
        const cleanStatus = status.toLowerCase(); // Memaksa format "up" atau "down"

        // B. Insert ke TimescaleDB (Time-series)
        await timescalePool.query(
            `INSERT INTO health_checks (time, service_id, tenant_id, status, response_time_ms)
       VALUES (NOW(), $1, $2, $3, $4)`,
            [serviceId, tenantId, cleanStatus, responseTimeMs]
        );

        // C. Evaluasi threshold (3x down berturut-turut)
        let newFailures = service.consecutive_failures;
        let newStatus = service.status;

        if (cleanStatus === 'down') {
            newFailures += 1;
            if (newFailures >= 3) {
                newStatus = 'UNHEALTHY';
            }
        } else if (cleanStatus === 'up') {
            newFailures = 0;
            newStatus = 'HEALTHY';
        }

        // Update status di tabel services
        await pgPool.query(
            'UPDATE services SET consecutive_failures = $1, status = $2 WHERE id = $3',
            [newFailures, newStatus, serviceId]
        );

        res.json({
            message: 'Ingest health check berhasil.',
            current_status: newStatus,
            consecutive_failures: newFailures
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saat ingest data.' });
    }
});

module.exports = router;