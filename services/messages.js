const {
  parseMessage,
  getCurrentTime,
  getTimePopularity,
  commands
} = require('../utils/tz-chatbot')
const { logger } = require('../utils/logger')

/**
 * Process incoming message
 * @param {Object} message - User's message
 * @returns {Object} Error, response
 */
const processMessage = async msg => {
  try {
    // Parse user's message
    const { username, isCommand, command, tz } = parseMessage()
    let response
    // User is executing a command (timeat || timepopularity)
    if (isCommand && tz && command) {
      if (command === commands.timeAt) {
        const { err, time } = await getCurrentTime(tz)
        if (err) {
          // Invalid timezone
          return { err }
        }
        response = time
      }

      if (command === commands.timePopularity) {
        const popularity = await getTimePopularity(tz)
        response = popularity.toString()
      }
    }

    return {
      err: null,
      response,
      username
    }

  } catch (e) {
    logger.error(e)
    throw e
  }
}

module.exports = {
  processMessage
}
