const express = require('express');
const router = express.Router();
const { pgPool, timescalePool } = require('../config/db');
const authenticateApiKey = require('../middleware/apiKey.middleware');
const notificationService = require('../services/notificationService');
const { ingestLimiter } = require('../middleware/rateLimit.middleware');
const logger = require('../services/logger');

// Gunakan API Key Guard untuk SEMUA rute di file ini
router.use(authenticateApiKey);

// 1. GET /agent/services - Agent meminta daftar service yang harus dipantau
router.get('/services', async (req, res) => {
    try {
        const result = await pgPool.query(
            'SELECT id, name, type, endpoint_url, container_name, check_interval, status, consecutive_failures, last_checked_at FROM services WHERE tenant_id = $1 ORDER BY id ASC',
            [req.tenantId]
        );
        res.json({ data: result.rows });
    } catch (err) {
        logger.error('Gagal mengambil data service untuk agent', {
            tenantId: req.tenantId,
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({ message: 'Gagal mengambil data service untuk agent.' });
    }
});

// Helper: Validasi response time
function isValidResponseTime(value) {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0;
}

// 2. POST /agent/health-checks/ingest - Agent mengirim data hasil pantauan
router.post('/health-checks/ingest', ingestLimiter, async (req, res) => {
    const { serviceId, status, responseTimeMs } = req.body;
    const tenantId = req.tenantId;

    if (!serviceId || !status || responseTimeMs === undefined) {
        return res.status(400).json({ message: 'Payload tidak lengkap.' });
    }

    if (!isValidResponseTime(responseTimeMs)) {
        return res.status(400).json({ message: 'responseTimeMs harus berupa angka non-negatif.' });
    }

    const normalizedResponseTime = Number(responseTimeMs);

    try {
        // A. Cek apakah serviceId benar-benar milik tenant tersebut
        const serviceRes = await pgPool.query(
            'SELECT id, name, status, consecutive_failures FROM services WHERE id = $1 AND tenant_id = $2',
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
            [serviceId, tenantId, normalizedInputStatus, normalizedResponseTime]
        );

        // C. Evaluasi threshold (3x down berturut-turut) & normalisasi status (HEALTHY | UNHEALTHY | UNKNOWN)
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

        const checkedAt = new Date().toISOString();

        // D. Update status, consecutive_failures, dan last_checked_at (scoped per tenant_id)
        await pgPool.query(
            `UPDATE services
             SET consecutive_failures = $1,
                 status = $2,
                 last_checked_at = $3
             WHERE id = $4 AND tenant_id = $5`,
            [newFailures, newStatus, checkedAt, serviceId, tenantId]
        );

        // Logger loh ya
        logger.info('Ingest health check diproses', {
            tenantId,
            serviceId,
            status: normalizedInputStatus,
            current_status: newStatus,
            consecutive_failures: newFailures
        });

        // E. Kirim notifikasi saat status menjadi UNHEALTHY (dengan cooldown di NotificationService)
        if (newStatus === 'UNHEALTHY') {
            try {
                const tenantRes = await pgPool.query(
                    'SELECT name, telegram_chat_id FROM tenants WHERE id = $1',
                    [tenantId]
                );
                const tenantRow = tenantRes.rows[0];
                const telegramChatId = tenantRow?.telegram_chat_id;

                await notificationService.dispatch(
                    {
                        tenantId,
                        tenantName: tenantRow?.name || `Tenant #${tenantId}`,
                        serviceId: service.id,
                        serviceName: service.name,
                        status: newStatus,
                        timestamp: checkedAt,
                        time: checkedAt,
                        action: `Status berubah menjadi UNHEALTHY (${newFailures}x gagal berturut-turut)`
                    },
                    {
                        tenantId,
                        telegram_chat_id: telegramChatId,
                        botToken: process.env.TELEGRAM_BOT_TOKEN
                    }
                );
            } catch (alertErr) {
                logger.error('Gagal memproses notifikasi UNHEALTHY', {
                    tenantId,
                    serviceId,
                    error: alertErr.message,
                    stack: alertErr.stack
                });
            }
        }

        return res.json({
            message: 'Ingest health check berhasil.',
            current_status: newStatus,
            consecutive_failures: newFailures,
            last_checked_at: checkedAt
        });
    } catch (err) {
        logger.error('Server error saat ingest data', {
            tenantId,
            serviceId,
            error: err.message,
            stack: err.stack
        });
        return res.status(500).json({ message: 'Server error saat ingest data.' });
    }
});

module.exports = router;