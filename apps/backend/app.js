const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { setupTimescaleDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const agentRoutes = require('./routes/agent.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Inisialisasi Database
setupTimescaleDB();

// Import dan jalankan swagger
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// Main Routes
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/agent', agentRoutes); // memuat rute untuk agent
app.use('/overview', overviewRoutes); // memuat rute untuk overview

const PORT = process.env.PORT || 5000;

// udah dihapus console.log yang mencetak URL database (ada ada saja suki ini karena bisa membocorkan info sensitif di log produksi, nak kena rodok mas amba ke?)

app.listen(PORT, () => {
    console.log(`Resilient Backend berjalan di http://localhost:${PORT}`);
    console.log(`Swagger docs tersedia di http://localhost:${PORT}/api-docs`);
});