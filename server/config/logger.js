const winston = require('winston');
const Sentry = require('@sentry/node');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Initialize Sentry
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport with colors for development
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // File transport for production logs
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

// Custom error handler that logs to both Winston and Sentry
const logError = (error, req = null) => {
  if (process.env.NODE_ENV === 'production' && req) {
    Sentry.withScope((scope) => {
      scope.setTag('path', req.path);
      scope.setUser({
        id: req.user?.id,
        ip_address: req.ip,
      });
      Sentry.captureException(error);
    });
  }
  
  logger.error(error);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logError(error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = {
  logger,
  logError,
};
