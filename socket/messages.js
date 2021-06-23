const { Server } = require('socket.io')
const { logger } = require('../utils/logger')
const { processMessage } = require('../services/messages')

module.exports = function (server) {
  const io = new Server(server)
  io.on('connection', (socket) => {
    logger.info(`new user connected with socket id ${socket.id}`)

    // eslint-disable-next-line consistent-return
    socket.on('message', async (msg) => {
      try {
        const { err, response } = await processMessage(msg)
        if (err) {
          return socket.emit('error', err)
        }
        if (response) {
          return socket.emit('response', response)
        }
      } catch (e) {
        logger.error(e)
        return socket.emit('error', 'mmm... didn\'t get that 🤔')
      }
    })

    socket.on('disconnect', () => {
      logger.info(`socket id ${socket.id} disconnected`)
    })
  })
}
