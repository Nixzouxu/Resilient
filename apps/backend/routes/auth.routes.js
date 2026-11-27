const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pgPool } = require('../config/db');
const logger = require('../services/logger');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('FATAL: Environment variable JWT_SECRET wajib diisi dan tidak boleh kosong.');
  }
  return secret;
}

// Fail Fast saat modul/aplikasi dimuat jika JWT_SECRET belum diset
getJwtSecret();

// Helper function untuk validasi email sederhana
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 1. Register Tenant & User
router.post('/register', async (req, res) => {
  const { tenant_name, name, email, password } = req.body;

  if (!tenant_name || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Format email tidak valid.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password minimal 8 karakter.' });
  }

  const client = await pgPool.connect();

  try {
    await client.query('BEGIN');

    // Cek apakah tenant sudah ada
    const existingTenant = await client.query(
      'SELECT id FROM tenants WHERE name = $1',
      [tenant_name]
    );

    if (existingTenant.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Nama tenant sudah digunakan.' });
    }

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

    logger.info('Tenant dan user berhasil diregistrasi', {
      tenantId: newTenant.id,
      userId: userRes.rows[0].id,
      email
    });

    res.status(201).json({
      message: 'Registrasi tenant berhasil.',
      tenant: newTenant,
      user: userRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Error saat registrasi', {
      error: err.message,
      email,
      tenant_name
    });

    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    res.status(500).json({ message: 'Gagal meregistrasi user/tenant.' });
  } finally {
    client.release();
  }
});

// 2. Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    const jwtSecret = getJwtSecret();

    const userRes = await pgPool.query(
      'SELECT id, name, email, password_hash, role, tenant_id FROM users WHERE email = $1',
      [email]
    );

    if (userRes.rows.length === 0) {
      logger.warn('Login gagal - user tidak ditemukan', {
        email,
        reason: 'user_not_found',
        ip: req.ip
      });
      return res.status(400).json({ message: 'Email atau password salah.' });
    }

    const user = userRes.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      logger.warn('Login gagal - password salah', {
        email,
        reason: 'invalid_credentials',
        ip: req.ip
      });
      return res.status(400).json({ message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    logger.info('Login berhasil', {
      userId: user.id,
      email,
      ip: req.ip
    });

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
    logger.error('Error saat proses login', {
      email: email || 'unknown',
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Gagal melakukan login.' });
  }
});

module.exports = router;