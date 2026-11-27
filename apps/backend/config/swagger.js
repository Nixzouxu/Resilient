const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 5000;

// Definisi Spesifikasi OpenAPI (Swagger)
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Resilient Backend API',
        version: '1.0.0',
        description: 'Dokumentasi API untuk Resilient - Self-Hosted Observability Platform',
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Local Development Server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Masukkan token JWT untuk endpoint yang dilindungi (contoh: CRUD Services, Overview, Alerts)',
            },
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-KEY',
                description: 'API Key Agent untuk ingest health check',
            },
        },
    },
    paths: {
        // ---- AUTH ROUTES ----
        '/auth/register': {
            post: {
                summary: 'Register Tenant & Admin',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['tenant_name', 'email', 'password'],
                                properties: {
                                    tenant_name: { type: 'string', example: 'Gampong Laksana' },
                                    name: { type: 'string', example: 'Admin Gampong' },
                                    email: { type: 'string', example: 'admin@gampong.id' },
                                    password: { type: 'string', example: 'password123' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Registrasi berhasil' },
                    409: { description: 'Email sudah terdaftar' },
                },
            },
        },
        '/auth/login': {
            post: {
                summary: 'Login Admin',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'admin@gampong.id' },
                                    password: { type: 'string', example: 'password123' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Login berhasil, mengembalikan JWT token' },
                    400: { description: 'Email atau password salah' },
                },
            },
        },

        // ---- OVERVIEW ROUTES ----
        '/overview': {
            get: {
                summary: 'Ambil ringkasan metrik tenant untuk halaman Overview',
                tags: ['Overview'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Ringkasan total_services, down_services, uptime_24h_pct, incidents_this_week, dan overall_status' },
                    401: { description: 'Token JWT tidak valid atau tidak disertakan' },
                },
            },
        },

        // ---- SERVICES ROUTES ----
        '/services': {
            get: {
                summary: 'Ambil daftar service tenant',
                tags: ['Services'],
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Sukses mengambil data' } },
            },
            post: {
                summary: 'Tambah service baru',
                tags: ['Services'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'type'],
                                properties: {
                                    name: { type: 'string', example: 'Web Desa' },
                                    type: { type: 'string', example: 'HTTP' },
                                    endpoint_url: { type: 'string', example: 'http://gampong.id' },
                                    container_name: { type: 'string', example: 'gampong_web' },
                                    check_interval: { type: 'integer', example: 30 },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: 'Service berhasil ditambah' } },
            },
        },
        '/services/{id}': {
            patch: {
                summary: 'Ubah data service milik tenant',
                tags: ['Services'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'integer', example: 1 },
                        description: 'ID service yang ingin diubah',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Web Desa Update' },
                                    type: { type: 'string', example: 'HTTP' },
                                    endpoint_url: { type: 'string', example: 'http://localhost:5000/health' },
                                    container_name: { type: 'string', example: 'gampong_web_v2' },
                                    check_interval: { type: 'integer', example: 60 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Service berhasil diperbarui' },
                    400: { description: 'ID atau payload tidak valid' },
                    404: { description: 'Service tidak ditemukan atau akses dilarang' },
                },
            },
            delete: {
                summary: 'Hapus service milik tenant',
                tags: ['Services'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'integer', example: 1 },
                        description: 'ID service yang ingin dihapus',
                    },
                ],
                responses: {
                    200: { description: 'Service berhasil dihapus' },
                    400: { description: 'ID service tidak valid' },
                    404: { description: 'Service tidak ditemukan atau akses dilarang' },
                },
            },
        },
        '/services/{id}/health-checks': {
            get: {
                summary: 'Ambil riwayat time-series health checks untuk service',
                tags: ['Services'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'integer', example: 1 },
                        description: 'ID service',
                    },
                    {
                        in: 'query',
                        name: 'range',
                        required: false,
                        schema: {
                            type: 'string',
                            enum: ['24h', '7d', '30d'],
                            default: '24h',
                        },
                        description: 'Rentang waktu riwayat (24h, 7d, atau 30d)',
                    },
                ],
                responses: {
                    200: { description: 'Riwayat health check berhasil diambil' },
                    400: { description: 'ID service atau parameter range tidak valid' },
                    404: { description: 'Service tidak ditemukan atau akses dilarang' },
                },
            },
        },

        // ---- ALERTS ROUTES ----
        '/alerts/telegram': {
            get: {
                summary: 'Cek status koneksi Telegram chat ID milik tenant',
                tags: ['Alerts'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Status koneksi Telegram berhasil diambil' },
                    401: { description: 'Token JWT tidak valid atau tidak disertakan' },
                    404: { description: 'Tenant tidak ditemukan' },
                },
            },
        },
        '/alerts/telegram/connect': {
            post: {
                summary: 'Hubungkan atau perbarui Telegram chat ID tenant',
                tags: ['Alerts'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['telegram_chat_id'],
                                properties: {
                                    telegram_chat_id: { type: 'string', example: '987654321' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Telegram chat ID berhasil dihubungkan' },
                    400: { description: 'telegram_chat_id wajib diisi' },
                    401: { description: 'Token JWT tidak valid atau tidak disertakan' },
                    404: { description: 'Tenant tidak ditemukan' },
                },
            },
        },

        // ---- AGENT & INGEST ROUTES ----
        '/agent/services': {
            get: {
                summary: 'Ambil daftar service untuk Agent',
                tags: ['Ingest'],
                security: [{ ApiKeyAuth: [] }],
                responses: {
                    200: { description: 'Daftar service milik tenant dari API Key' },
                    401: { description: 'Header X-API-KEY wajib disertakan atau tidak valid' },
                },
            },
        },
        '/agent/health-checks/ingest': {
            post: {
                summary: 'Ingest data health check dari Agent',
                tags: ['Ingest'],
                security: [{ ApiKeyAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['serviceId', 'status', 'responseTimeMs'],
                                properties: {
                                    serviceId: { type: 'integer', example: 1 },
                                    status: { type: 'string', example: 'DOWN' },
                                    responseTimeMs: { type: 'integer', example: 150 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Ingest berhasil' },
                    400: { description: 'Payload tidak lengkap atau status tidak valid' },
                    401: { description: 'Header X-API-KEY wajib disertakan atau tidak valid' },
                    403: { description: 'Service tidak valid atau bukan milik tenant ini' },
                },
            },
        },
    },
};

const swaggerOptions = {
    swaggerDefinition,
    apis: [],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    console.log(`📄 Swagger API Docs tersedia di http://localhost:${PORT}/api-docs`);
};

module.exports = setupSwagger;