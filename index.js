require('dotenv-flow').config()

const asciify = require('asciify')
const http = require('http')
const app = require('./app')

const server = http.createServer(app)
// Add socket channel
require('./socket/messages')(server)
// Add IRC channel
require('./irc/tz-chatbot')()
const { logger } = require('./utils/logger')

const PORT = process.env.PORT || 3000;

logger.info(`Environment ${process.env.NODE_ENV}`)

server.listen(PORT, () => {
  asciify('Chatbot Service', 'doom', (err, result) => {
    logger.info(`\n${result}`)
    logger.info(`🚀  Server listening on port ${PORT}`)
  })
})

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    });
  } else {
    process.exit(1)
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error)
  exitHandler()
};

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})