class Logger {
    constructor(serviceName = 'resilient-backend', minLevel = 'info') {
        this.serviceName = serviceName;
        this.levels = {
            info: 1,
            warn: 2,
            error: 3
        };
        this.minLevelValue = this.levels[minLevel] || this.levels.info;
    }

    formatTimestamp() {
        return new Date().toISOString();
    }

    shouldLog(level) {
        const current = this.levels[level];
        if (!current) return true;
        return current >= this.minLevelValue;
    }

    write(level, message, meta = null) {
        if (!this.shouldLog(level)) return;

        const ts = this.formatTimestamp();
        const upperLevel = level.toUpperCase();
        const prefix = `[${ts}] [${upperLevel}] [${this.serviceName}]`;

        let line = `${prefix} ${message}`;
        if (meta && Object.keys(meta).length > 0) {
            line += ` ${JSON.stringify(meta)}`;
        }

        if (level === 'error') {
            console.error(line);
        } else if (level === 'warn') {
            console.warn(line);
        } else {
            console.log(line);
        }
    }

    info(message, meta = null) {
        this.write('info', message, meta);
    }

    warn(message, meta = null) {
        this.write('warn', message, meta);
    }

    error(message, meta = null) {
        this.write('error', message, meta);
    }

    // Express middleware untuk mencatat setiap request masuk & status responsnya
    requestMiddleware() {
        return (req, res, next) => {
            const start = Date.now();

            res.on('finish', () => {
                const durationMs = Date.now() - start;
                const meta = {
                    method: req.method,
                    path: req.originalUrl,
                    statusCode: res.statusCode,
                    durationMs,
                    ip: req.ip
                };

                if (res.statusCode >= 500) {
                    this.error('HTTP request selesai dengan server error', meta);
                } else if (res.statusCode >= 400) {
                    this.warn('HTTP request selesai dengan client error', meta);
                } else {
                    this.info('HTTP request selesai', meta);
                }
            });

            next();
        };
    }

    // Express error-handling middleware terpusat
    errorMiddleware() {
        return (err, req, res, next) => {
            this.error('Unhandled error pada Express', {
                method: req.method,
                path: req.originalUrl,
                error: err.message,
                stack: err.stack
            });

            if (res.headersSent) {
                return next(err);
            }

            return res.status(err.status || 500).json({
                message: err.message || 'Terjadi kesalahan pada server.'
            });
        };
    }
}

module.exports = new Logger('resilient-backend', process.env.LOG_LEVEL || 'info');
module.exports.Logger = Logger;