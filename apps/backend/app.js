const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { setupTimescaleDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const agentRoutes = require('./routes/agent.routes');
const overviewRoutes = require('./routes/overview.routes');
const alertRoutes = require('./routes/alert.routes');
const logger = require('./services/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger.requestMiddleware());

// Inisialisasi TimescaleDB hanya saat jalan di lokal atau Docker (bukan Vercel)
if (!process.env.VERCEL) {
    setupTimescaleDB();
}

// Import dan jalankan swagger
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// Route kesehatan sederhana untuk cek cepat di browser
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'Resilient Backend API' });
});

// Urusan CORS agar hanya mengizinkan origin tertentu (misal frontend) 
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Izinkan request non-browser / tanpa header Origin atau saat FRONTEND_ORIGIN belum diset (lokal) nanti diubah ya mas amba
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS.`));
        },
        credentials: true
    })
);

// Main Routes
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);

app.use('/agent', agentRoutes); // memuat rute untuk agent
app.use('/overview', overviewRoutes); // memuat rute untuk overview
app.use('/alerts', alertRoutes);
app.use(logger.errorMiddleware());


const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Resilient Backend berjalan di http://localhost:${PORT}`);
        console.log(`Swagger docs tersedia di http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;