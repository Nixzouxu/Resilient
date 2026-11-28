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

// Helper: Validasi serviceId
function isValidServiceId(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
}

/**
 * Helper: Evaluasi threshold dan hitung status baru
 * @returns {{ newFailures: number, newStatus: string, shouldNotify: boolean, notificationType: 'unhealthy' | 'recovered' | null }}
 */
function evaluateHealthStatus(currentStatus, currentFailures, inputStatus) {
    let newFailures = currentFailures ?? 0;
    let newStatus = ['HEALTHY', 'UNHEALTHY', 'UNKNOWN'].includes(currentStatus)
        ? currentStatus
        : 'UNKNOWN';

    let shouldNotify = false;
    let notificationType = null;

    if (inputStatus === 'down') {
        newFailures += 1;
        if (newFailures >= 3 && currentStatus !== 'UNHEALTHY') {
            newStatus = 'UNHEALTHY';
            shouldNotify = true;
            notificationType = 'unhealthy';
        }
    } else if (inputStatus === 'up') {
        if (currentStatus === 'UNHEALTHY') {
            shouldNotify = true;
            notificationType = 'recovered';
        }
        newFailures = 0;
        newStatus = 'HEALTHY';
    }

    return { newFailures, newStatus, shouldNotify, notificationType };
}

/**
 * Helper: Kirim notifikasi ke tenant
 */
async function sendNotification(tenantId, service, newStatus, newFailures, checkedAt, notificationType) {
    try {
        const tenantRes = await pgPool.query(
            'SELECT name, telegram_chat_id FROM tenants WHERE id = $1',
            [tenantId]
        );
        const tenantRow = tenantRes.rows[0];

        if (!tenantRow?.telegram_chat_id) {
            logger.warn('Tenant tidak memiliki telegram_chat_id', { tenantId });
            return;
        }

        const actionText = notificationType === 'unhealthy'
            ? `Status berubah menjadi UNHEALTHY (${newFailures}x gagal berturut-turut)`
            : 'Service pulih dari UNHEALTHY menjadi HEALTHY';

        await notificationService.dispatch(
            {
                tenantId,
                tenantName: tenantRow.name || `Tenant #${tenantId}`,
                serviceId: service.id,
                serviceName: service.name,
                status: newStatus,
                timestamp: checkedAt,
                action: actionText
            },
            {
                tenantId,
                telegram_chat_id: tenantRow.telegram_chat_id,
                botToken: process.env.TELEGRAM_BOT_TOKEN
            }
        );
    } catch (alertErr) {
        logger.error('Gagal memproses notifikasi Telegram', {
            tenantId,
            serviceId: service.id,
            notificationType,
            error: alertErr.message,
            stack: alertErr.stack
        });
    }
}

// 2. POST /agent/health-checks/ingest - Agent mengirim data hasil pantauan
router.post('/health-checks/ingest', ingestLimiter, async (req, res) => {
    const { serviceId, status, responseTimeMs } = req.body;
    const tenantId = req.tenantId;

    // [FIX] Validasi lebih ketat untuk semua field
    if (!serviceId || !status || responseTimeMs === undefined) {
        return res.status(400).json({ message: 'Payload tidak lengkap.' });
    }

    if (!isValidServiceId(serviceId)) {
        return res.status(400).json({ message: 'serviceId harus berupa integer positif.' });
    }

    if (!isValidResponseTime(responseTimeMs)) {
        return res.status(400).json({ message: 'responseTimeMs harus berupa angka non-negatif.' });
    }

    const normalizedResponseTime = Number(responseTimeMs);
    const normalizedInputStatus = String(status).toLowerCase();

    if (!['up', 'down'].includes(normalizedInputStatus)) {
        return res.status(400).json({ message: 'Status harus bernilai "up" atau "down".' });
    }

    const client = await pgPool.connect();

    try {
        // [FIX] Gunakan transaction untuk konsistensi data
        await client.query('BEGIN');

        // A. Cek apakah serviceId benar-benar milik tenant tersebut (dengan FOR UPDATE untuk lock)
        const serviceRes = await client.query(
            'SELECT id, name, status, consecutive_failures FROM services WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
            [serviceId, tenantId]
        );

        if (serviceRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Service tidak valid atau bukan milik tenant ini.' });
        }

        const service = serviceRes.rows[0];

        // B. Evaluasi threshold menggunakan helper function
        const { newFailures, newStatus, shouldNotify, notificationType } = evaluateHealthStatus(
            service.status,
            service.consecutive_failures,
            normalizedInputStatus
        );

        const checkedAt = new Date().toISOString();

        // C. Update status, consecutive_failures, dan last_checked_at
        await client.query(
            `UPDATE services
             SET consecutive_failures = $1,
                 status = $2,
                 last_checked_at = $3
             WHERE id = $4 AND tenant_id = $5`,
            [newFailures, newStatus, checkedAt, serviceId, tenantId]
        );

        // D. Insert ke TimescaleDB (Time-series)
        // [NOTE] TimescaleDB connection terpisah, tidak bisa dalam transaction yang sama
        await timescalePool.query(
            `INSERT INTO health_checks (time, service_id, tenant_id, status, response_time_ms)
             VALUES (NOW(), $1, $2, $3, $4)`,
            [serviceId, tenantId, normalizedInputStatus, normalizedResponseTime]
        );

        await client.query('COMMIT');

        // E. Kirim notifikasi (diluar transaction karena tidak perlu rollback)
        // [FIX] Hanya ada satu blok notifikasi, tidak ada duplikasi
        if (shouldNotify && notificationType) {
            await sendNotification(tenantId, service, newStatus, newFailures, checkedAt, notificationType);
        }

        logger.info('Ingest health check diproses', {
            tenantId,
            serviceId,
            status: normalizedInputStatus,
            current_status: newStatus,
            consecutive_failures: newFailures
        });

        return res.json({
            message: 'Ingest health check berhasil.',
            current_status: newStatus,
            consecutive_failures: newFailures,
            last_checked_at: checkedAt
        });

    } catch (err) {
        await client.query('ROLLBACK');
        logger.error('Server error saat ingest data', {
            tenantId,
            serviceId,
            error: err.message,
            stack: err.stack
        });
        return res.status(500).json({ message: 'Server error saat ingest data.' });
    } finally {
        client.release();
    }
});

module.exports = router;