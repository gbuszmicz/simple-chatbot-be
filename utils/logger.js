// Logger to be used anywhere in the code
const logger = require('pino')({
  prettyPrint: process.env.NODE_ENV === 'development',
  level: process.env.LOG_LEVEL || 'info'
});

// Middleware for express framework
const loggerMiddleware = require('pino-http')({
  autoLogging: false,
  prettyPrint: process.env.NODE_ENV === 'development',
  enabled: process.env.NODE_ENV !== 'test',
});

module.exports = {
  logger,
  loggerMiddleware
}