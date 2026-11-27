const express = require('express');
const router = express.Router();
const { pgPool } = require('../config/db');
const authenticateJWT = require('../middleware/auth.middleware');

router.use(authenticateJWT);

// GET /alerts/telegram - Cek status koneksi Telegram tenant saat ini
router.get('/telegram', async (req, res) => {
    try {
        const result = await pgPool.query(
            'SELECT id, name, telegram_chat_id FROM tenants WHERE id = $1',
            [req.user.tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant tidak ditemukan.' });
        }

        const tenant = result.rows[0];
        res.json({
            connected: Boolean(tenant.telegram_chat_id),
            data: tenant
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil konfigurasi Telegram.' });
    }
});

// POST /alerts/telegram/connect - Hubungkan atau perbarui chat ID Telegram tenant
router.post('/telegram/connect', async (req, res) => {
    const { telegram_chat_id } = req.body;

    if (!telegram_chat_id || !String(telegram_chat_id).trim()) {
        return res.status(400).json({ message: 'telegram_chat_id wajib diisi.' });
    }

    try {
        const result = await pgPool.query(
            `UPDATE tenants
       SET telegram_chat_id = $1
       WHERE id = $2
       RETURNING id, name, telegram_chat_id`,
            [String(telegram_chat_id).trim(), req.user.tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant tidak ditemukan.' });
        }

        res.json({
            message: 'Telegram chat ID berhasil dihubungkan.',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal menghubungkan Telegram chat ID.' });
    }
});

module.exports = router;