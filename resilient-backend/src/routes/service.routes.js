const express = require('express');
const router = express.Router();
const { pgPool } = require('../config/db');
const authenticateJWT = require('../middleware/auth.middleware');

// Gunakan JWT Guard untuk semua endpoint service
router.use(authenticateJWT);

// GET /services - Ambil daftar service khusus milik tenant yang sedang login (Multi-Tenant Isolation)
router.get('/', async (req, res) => {
  try {
    const services = await pgPool.query(
      'SELECT * FROM services WHERE tenant_id = $1 ORDER BY id DESC',
      [req.user.tenantId]
    );
    res.json({ data: services.rows });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data service.' });
  }
});

// POST /services - Tambah service baru untuk dipantau
router.post('/', async (req, res) => {
  const { name, type, endpoint_url, container_name, check_interval } = req.body;

  try {
    const newService = await pgPool.query(
      `INSERT INTO services (tenant_id, name, type, endpoint_url, container_name, check_interval)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.tenantId, name, type, endpoint_url, container_name || null, check_interval || 30]
    );
    res.status(201).json({ message: 'Service berhasil ditambahkan.', data: newService.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan service.' });
  }
});

// DELETE /services/:id - Hapus service
router.delete('/:id', async (req, res) => {
  try {
    const deleteRes = await pgPool.query(
      'DELETE FROM services WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [req.params.id, req.user.tenantId]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ message: 'Service tidak ditemukan atau akses dilarang.' });
    }

    res.json({ message: 'Service berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus service.' });
  }
});

module.exports = router;