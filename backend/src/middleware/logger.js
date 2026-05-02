const { createLogger } = require('../utils/logger');

const logger = createLogger('http');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Capture response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger[logLevel]({
            message: 'HTTP Request',
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentLength: res.get('Content-Length') || '0',
            ...(req.user && { userId: req.user.id })
        });
    });

    next();
};

/**
 * Response logging middleware
 */
const responseLogger = (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (body) {
        logger.debug({
            message: 'Response Body',
            method: req.method,
            url: req.url,
            body: typeof body === 'string' ? body.substring(0, 500) : body,
            statusCode: res.statusCode
        });
        return originalSend.call(this, body);
    };

    res.json = function (body) {
        logger.debug({
            message: 'Response JSON',
            method: req.method,
            url: req.url,
            body: typeof body === 'object' ? JSON.stringify(body).substring(0, 500) : body,
            statusCode: res.statusCode
        });
        return originalJson.call(this, body);
    };

    next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
    logger.error({
        message: 'Request Error',
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next(err);
};

module.exports = {
    requestLogger,
    responseLogger,
    errorLogger
};