const express = require('express');
const router = express.Router();
const { pgPool, timescalePool } = require('../config/db');
const authenticateJWT = require('../middleware/auth.middleware');

router.use(authenticateJWT);

// GET /overview - Ringkasan metrik tenant untuk halaman Overview dashboard
router.get('/', async (req, res) => {
    const tenantId = req.user.tenantId;

    try {
        // 1. Total service & jumlah service UNHEALTHY milik tenant
        const servicesStatsRes = await pgPool.query(
            `SELECT
         COUNT(*)::int AS total_services,
         COUNT(*) FILTER (WHERE status = 'UNHEALTHY')::int AS down_services
       FROM services
       WHERE tenant_id = $1`,
            [tenantId]
        );
        const { total_services, down_services } = servicesStatsRes.rows[0];

        // 2. Uptime rata-rata 24 jam dari health_checks milik tenant
        const uptimeRes = await timescalePool.query(
            `SELECT
         COUNT(*)::int AS total_checks,
         COUNT(*) FILTER (WHERE LOWER(status) = 'up')::int AS up_checks
       FROM health_checks
       WHERE tenant_id = $1
         AND time >= NOW() - INTERVAL '24 hours'`,
            [tenantId]
        );
        const { total_checks, up_checks } = uptimeRes.rows[0];
        const uptime_24h_pct =
            total_checks > 0 ? Number(((up_checks / total_checks) * 100).toFixed(2)) : null;

        // 3. Jumlah kejadian "down" dalam 7 hari terakhir (fallback aman sebelum tabel incidents dibuat)
        const incidentsRes = await timescalePool.query(
            `SELECT COUNT(*)::int AS incidents_this_week
       FROM health_checks
       WHERE tenant_id = $1
         AND LOWER(status) = 'down'
         AND time >= NOW() - INTERVAL '7 days'`,
            [tenantId]
        );
        const incidents_this_week = incidentsRes.rows[0].incidents_this_week;

        // 4. Status keseluruhan tenant
        let overall_status = 'HEALTHY';
        if (total_services === 0) {
            overall_status = 'UNKNOWN';
        } else if (down_services > 0) {
            overall_status = 'DEGRADED';
        }

        res.json({
            data: {
                total_services,
                down_services,
                uptime_24h_pct,
                incidents_this_week,
                overall_status
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil ringkasan overview.' });
    }
});

module.exports = router;