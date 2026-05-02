const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'info';
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define the format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console(),

    // File transport for errors
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),

    // File transport for all logs
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];

// Create the logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

/**
 * Create a child logger with a specific context
 * @param {string} context - The context/component name
 * @returns {Object} - Child logger instance
 */
const createLogger = (context) => {
    return {
        error: (message, meta = {}) => logger.error({ message, context, ...meta }),
        warn: (message, meta = {}) => logger.warn({ message, context, ...meta }),
        info: (message, meta = {}) => logger.info({ message, context, ...meta }),
        http: (message, meta = {}) => logger.http({ message, context, ...meta }),
        debug: (message, meta = {}) => logger.debug({ message, context, ...meta }),
        log: (level, message, meta = {}) => logger.log(level, { message, context, ...meta }),
    };
};

module.exports = {
    logger,
    createLogger,
};