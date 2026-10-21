const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const ingestRoutes = require('./routes/ingest.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Inisialisasi Database
initDb();

// Main Routes
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/', ingestRoutes); // memuat /health-check

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Resilient Backend API berjalan di port ${PORT}`);
});