const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pgPool } = require('../config/db');

// 1. Register Tenant & User
router.post('/register', async (req, res) => {
  const { tenant_name, email, password } = req.body;

  if (!tenant_name || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  try {
    // Generate API Key acak unik untuk tenant
    const apiKey = 'rsl_' + crypto.randomBytes(16).toString('hex');

    // Simpan Tenant baru
    const tenantRes = await pgPool.query(
      'INSERT INTO tenants (name, api_key) VALUES ($1, $2) RETURNING id, name, api_key',
      [tenant_name, apiKey]
    );
    const newTenant = tenantRes.rows[0];

    // Hash password & simpan User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRes = await pgPool.query(
      'INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [newTenant.id, email, passwordHash, 'admin']
    );

    res.status(201).json({
      message: 'Registrasi tenant berhasil.',
      tenant: newTenant,
      user: userRes.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal meregistrasi user/tenant.' });
  }
});

// 2. Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

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

    // Sign JWT Token
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil.',
      token,
      user: { id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id }
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal melakukan login.' });
  }
});

module.exports = router;