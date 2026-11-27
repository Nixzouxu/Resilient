const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth.middleware');
const { pgPool, timescalePool } = require('../config/db');

// Gunakan JWT Guard untuk semua endpoint service
router.use(authenticateJWT);


const RANGE_INTERVAL_MAP = {
  '24h': '24 hours',
  '7d': '7 days',
  '30d': '30 days'
};

// GET /services/:id/health-checks?range=24h (24h | 7d | 30d)
router.get('/:id/health-checks', async (req, res) => {
  const serviceId = Number(req.params.id);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return res.status(400).json({ message: 'ID service tidak valid.' });
  }

  const rangeParam = String(req.query.range || '24h').toLowerCase();
  const interval = RANGE_INTERVAL_MAP[rangeParam];
  if (!interval) {
    return res.status(400).json({
      message: 'Parameter range tidak valid. Gunakan salah satu dari: 24h, 7d, 30d.'
    });
  }

  try {
    // 1. Pastikan service ada dan benar-benar milik tenant yang login
    const serviceRes = await pgPool.query(
      'SELECT id, name FROM services WHERE id = $1 AND tenant_id = $2',
      [serviceId, req.user.tenantId]
    );
    if (serviceRes.rows.length === 0) {
      return res.status(404).json({ message: 'Service tidak ditemukan atau akses dilarang.' });
    }

    // 2. Ambil riwayat health check dari TimescaleDB urut waktu naik (bagus untuk chart)
    const checksRes = await timescalePool.query(
      `SELECT time, status, response_time_ms
       FROM health_checks
       WHERE service_id = $1
         AND tenant_id = $2
         AND time >= NOW() - ($3::interval)
       ORDER BY time ASC`,
      [serviceId, req.user.tenantId, interval]
    );

    res.json({
      service_id: serviceId,
      range: rangeParam,
      data: checksRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil riwayat health checks.' });
  }
});

// GET /services - Ambil daftar service khusus milik tenant yang sedang login (Multi-Tenant Isolation)
router.get('/', async (req, res) => {
  try {
    const services = await pgPool.query(
      'SELECT * FROM services WHERE tenant_id = $1 ORDER BY id DESC',
      [req.user.tenantId]
    );
    res.json({ data: services.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data service.' });
  }
});

// POST /services - Tambah service baru untuk dipantau
router.post('/', async (req, res) => {
  const { name, type, endpoint_url, container_name, check_interval } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Field name dan type wajib diisi.' });
  }

  try {
    const newService = await pgPool.query(
      `INSERT INTO services (tenant_id, name, type, endpoint_url, container_name, check_interval)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.tenantId, name, type, endpoint_url, container_name || null, check_interval || 30]
    );
    res.status(201).json({ message: 'Service berhasil ditambahkan.', data: newService.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan service.' });
  }
});

// PATCH /services/:id - Ubah data service milik tenant yang sedang login
router.patch('/:id', async (req, res) => {
  const serviceId = Number(req.params.id);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return res.status(400).json({ message: 'ID service tidak valid.' });
  }

  const allowedFields = ['name', 'type', 'endpoint_url', 'container_name', 'check_interval'];
  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== undefined) {
      if (field === 'check_interval') {
        const intervalVal = Number(req.body[field]);
        if (!Number.isInteger(intervalVal) || intervalVal <= 0) {
          return res.status(400).json({ message: 'check_interval harus berupa bilangan bulat positif.' });
        }
        updates.push(`${field} = $${paramIndex}`);
        values.push(intervalVal);
      } else {
        updates.push(`${field} = $${paramIndex}`);
        values.push(req.body[field]);
      }
      paramIndex += 1;
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'Tidak ada field valid yang dikirim untuk diperbarui.' });
  }

  values.push(serviceId, req.user.tenantId);

  try {
    const updateRes = await pgPool.query(
      `UPDATE services
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ message: 'Service tidak ditemukan atau akses dilarang.' });
    }

    res.json({ message: 'Service berhasil diperbarui.', data: updateRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui service.' });
  }
});

// DELETE /services/:id - Hapus service
router.delete('/:id', async (req, res) => {
  const serviceId = Number(req.params.id);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return res.status(400).json({ message: 'ID service tidak valid.' });
  }

  try {
    const deleteRes = await pgPool.query(
      'DELETE FROM services WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [serviceId, req.user.tenantId]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ message: 'Service tidak ditemukan atau akses dilarang.' });
    }

    res.json({ message: 'Service berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus service.' });
  }
});

module.exports = router;