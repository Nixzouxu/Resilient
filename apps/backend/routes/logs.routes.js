const express = require('express');
const router = express.Router();
const { pgPool } = require('../config/db');
const authenticateJWT = require('../middleware/auth.middleware');
const authenticateApiKey = require('../middleware/apiKey.middleware');
const logger = require('../services/logger');
// [FIX] Import rate limiter untuk NFR-6.2
const { ingestLimiter } = require('../middleware/rateLimit.middleware');

const ALLOWED_LEVELS = ['info', 'warn', 'error'];
const RANGE_TO_INTERVAL = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
    '30d': '30 days'
};

// [FIX] Ekstrak logic validasi single log ke helper function untuk mendukung batch
async function processSingleLog(tenantId, logItem) {
    const { serviceId, level = 'info', source = 'agent', message, meta = {} } = logItem;

    if (!message || !String(message).trim()) {
        throw new Error('Field message wajib diisi.');
    }

    const normalizedLevel = String(level).toLowerCase();
    if (!ALLOWED_LEVELS.includes(normalizedLevel)) {
        throw new Error('Level log tidak valid.');
    }

    let validServiceId = null;
    if (serviceId !== undefined && serviceId !== null) {
        const parsedId = Number(serviceId);
        if (!Number.isInteger(parsedId) || parsedId <= 0) {
            throw new Error('serviceId tidak valid.');
        }

        const serviceCheck = await pgPool.query(
            'SELECT id FROM services WHERE id = $1 AND tenant_id = $2',
            [parsedId, tenantId]
        );
        if (serviceCheck.rows.length === 0) {
            throw new Error('Service tidak ditemukan atau bukan milik tenant ini.');
        }
        validServiceId = parsedId;
    }

    const safeMeta = typeof meta === 'object' && meta !== null && !Array.isArray(meta)
        ? meta
        : { raw: meta };

    return {
        tenantId,
        serviceId: validServiceId,
        level: normalizedLevel,
        source: String(source).trim() || 'agent',
        message: String(message).trim(),
        meta: JSON.stringify(safeMeta)
    };
}

// POST /ingest - Agent mengirim log terstruktur milik tenant
// [FIX] Tambahkan ingestLimiter sesuai NFR-6.2
router.post('/ingest', authenticateApiKey, ingestLimiter, async (req, res) => {
    const tenantId = req.tenantId;

    // [FIX] Support single object atau array of objects (batch) sesuai SDD 2.2
    const logsToProcess = Array.isArray(req.body) ? req.body : [req.body];

    if (logsToProcess.length === 0) {
        return res.status(400).json({ message: 'Payload log kosong.' });
    }

    // Batasi jumlah batch untuk mencegah memory overload (misal max 100 log per request)
    if (logsToProcess.length > 100) {
        return res.status(400).json({ message: 'Maksimal 100 log per batch request.' });
    }

    try {
        const validLogs = [];
        const errors = [];

        for (const [index, logItem] of logsToProcess.entries()) {
            try {
                const processed = await processSingleLog(tenantId, logItem);
                validLogs.push(processed);
            } catch (err) {
                errors.push({ index, error: err.message });
            }
        }

        if (validLogs.length > 0) {
            // [FIX] Batch insert menggunakan single query untuk performa (NFR-3)
            const values = [];
            const params = [];
            let paramIndex = 1;

            for (const log of validLogs) {
                values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}::jsonb)`);
                params.push(log.tenantId, log.serviceId, log.level, log.source, log.message, log.meta);
            }

            const queryText = `
                INSERT INTO service_logs (tenant_id, service_id, level, source, message, meta)
                VALUES ${values.join(', ')}
            `;

            await pgPool.query(queryText, params);
        }

        logger.info('Log berhasil di-ingest', {
            tenantId,
            successCount: validLogs.length,
            errorCount: errors.length
        });

        return res.status(201).json({
            message: 'Log berhasil disimpan.',
            inserted: validLogs.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err) {
        logger.error('Gagal ingest log', { tenantId, error: err.message });
        return res.status(500).json({ message: 'Gagal menyimpan log.' });
    }
});

// [FIX] Ubah dari '/logs' menjadi '/' agar tidak menjadi double path (/logs/logs) 
// saat router ini di-mount di app.use('/logs', logRouter)
router.get('/', authenticateJWT, async (req, res) => {
    const tenantId = req.user.tenantId;
    const { serviceId, level, range = '24h', limit = '100', search = '' } = req.query;

    const interval = RANGE_TO_INTERVAL[range];
    if (!interval) {
        return res.status(400).json({
            message: 'Parameter range tidak valid. Gunakan 1h, 24h, 7d, atau 30d.'
        });
    }

    const parsedLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

    const conditions = [
        'l.tenant_id = $1'
    ];
    const params = [tenantId];
    let idx = 2;

    // [FIX] Parameterize INTERVAL untuk menghindari string interpolation di SQL
    conditions.push(`l.created_at >= NOW() - $${idx}::INTERVAL`);
    params.push(interval);
    idx++;

    if (serviceId !== undefined && serviceId !== '') {
        const parsedServiceId = Number(serviceId);
        if (!Number.isInteger(parsedServiceId) || parsedServiceId <= 0) {
            return res.status(400).json({ message: 'Parameter serviceId tidak valid.' });
        }
        conditions.push(`l.service_id = $${idx++}`);
        params.push(parsedServiceId);
    }

    if (level !== undefined && level !== '') {
        const normalizedLevel = String(level).toLowerCase();
        if (!ALLOWED_LEVELS.includes(normalizedLevel)) {
            return res.status(400).json({
                message: 'Parameter level tidak valid. Gunakan info, warn, atau error.'
            });
        }
        conditions.push(`l.level = $${idx++}`);
        params.push(normalizedLevel);
    }

    if (String(search).trim()) {
        conditions.push(`l.message ILIKE $${idx++}`);
        params.push(`%${String(search).trim()}%`);
    }

    params.push(parsedLimit);

    try {
        const queryText = `
            SELECT
                l.id,
                l.service_id,
                s.name AS service_name,
                l.level,
                l.source,
                l.message,
                l.meta,
                l.created_at
            FROM service_logs l
            LEFT JOIN services s
                ON s.id = l.service_id AND s.tenant_id = l.tenant_id
            WHERE ${conditions.join(' AND ')}
            ORDER BY l.created_at DESC, l.id DESC
            LIMIT $${idx}
        `;

        const result = await pgPool.query(queryText, params);

        return res.json({
            range,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        logger.error('Gagal mengambil data logs', { tenantId, error: err.message });
        return res.status(500).json({ message: 'Gagal mengambil data logs.' });
    }
});

module.exports = router;