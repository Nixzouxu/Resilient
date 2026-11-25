const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' }
});

const ingestLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.header('x-api-key') || req.ip,
    message: { message: 'Terlalu banyak request ingest. Rate limit tercapai.' }
});

module.exports = { loginLimiter, ingestLimiter };