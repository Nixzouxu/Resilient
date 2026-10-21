const { pgPool } = require('../config/db');

// Middleware untuk memvalidasi API Key Agent saat ingest metrics/health-check
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'Header X-API-KEY wajib disertakan.' });
  }

  try {
    const result = await pgPool.query('SELECT id FROM tenants WHERE api_key = $1', [apiKey]);
    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'API Key tidak valid.' });
    }

    req.tenantId = result.rows[0].id; // Menyimpan tenant_id ke request
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error saat validasi API Key.' });
  }
};

module.exports = authenticateApiKey;