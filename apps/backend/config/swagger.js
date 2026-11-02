const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
            url: 'http://localhost:5000',
            description: 'Local Development Server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Masukkan token JWT untuk endpoint yang dilindungi (contoh: CRUD Services)',
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
                                properties: {
                                    tenant_name: { type: 'string', example: 'Gampong Laksana' },
                                    email: { type: 'string', example: 'admin@gampong.id' },
                                    password: { type: 'string', example: 'password123' },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: 'Registrasi berhasil' } },
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
                                properties: {
                                    email: { type: 'string', example: 'admin@gampong.id' },
                                    password: { type: 'string', example: 'password123' },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: 'Login berhasil, mengembalikan JWT token' } },
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

        // ---- INGEST ROUTES ----
        '/health-check': {
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
                                properties: {
                                    service_id: { type: 'integer', example: 1 },
                                    status: { type: 'string', example: 'DOWN' },
                                    response_time_ms: { type: 'integer', example: 150 },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: 'Ingest berhasil' } },
            },
        },
    },
};

const swaggerOptions = {
    swaggerDefinition,
    apis: [], // Kita biarkan kosong karena semua schema sudah kita tulis langsung di atas agar lebih rapi
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    console.log('📄 Swagger API Docs tersedia di http://localhost:5000/api-docs');
};

module.exports = setupSwagger;