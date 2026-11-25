const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { pgPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Rate Limiter untuk endpoint login (mencegah brute-force attack)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5 percobaan login gagal per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.' }
});

// 1. Register Tenant & User
router.post('/register', async (req, res) => {
  const { tenant_name, name, email, password } = req.body;

  if (!tenant_name || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  const client = await pgPool.connect();

  try {
    await client.query('BEGIN');
    const apiKey = 'rsl_' + crypto.randomBytes(16).toString('hex');

    const tenantRes = await client.query(
      'INSERT INTO tenants (name, api_key) VALUES ($1, $2) RETURNING id, name, api_key',
      [tenant_name, apiKey]
    );
    const newTenant = tenantRes.rows[0];

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userName = name || email.split('@')[0];

    const userRes = await client.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, tenant_id`,
      [newTenant.id, userName, email, passwordHash, 'admin']
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Registrasi tenant berhasil.',
      tenant: newTenant,
      user: userRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }
    res.status(500).json({ message: 'Gagal meregistrasi user/tenant.' });
  } finally {
    client.release();
  }
});

// 2. Login User (Dipasang loginLimiter di sini)
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    const userRes = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: 'Email atau password salah.' });
    }

    const user = userRes.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal melakukan login.' });
  }
});

module.exports = router;