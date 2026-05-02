const { createLogger } = require('../utils/logger');

const logger = createLogger('errorHandler');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

    // Log the error
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode
    });

    // Determine if it's an operational error or programming error
    const isOperational = err.isOperational || false;

    // Send response
    res.status(statusCode).json({
        error: {
            message,
            statusCode,
            ...(stack && { stack }),
            ...(isOperational && { type: 'Operational Error' })
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Custom error class for operational errors
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async handler wrapper to catch async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 */
const validationErrorHandler = (error) => {
    if (error.name === 'ValidationError') {
        return new AppError(`Validation Error: ${error.message}`, 400);
    }
    if (error.name === 'CastError') {
        return new AppError(`Invalid ID format`, 400);
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return new AppError(`Duplicate field value: ${field}`, 400);
    }
    return error;
};

module.exports = {
    errorHandler,
    AppError,
    asyncHandler,
    validationErrorHandler
};