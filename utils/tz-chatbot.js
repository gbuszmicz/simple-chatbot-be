/* eslint-disable prefer-destructuring */
const axios = require('axios')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const { logger } = require('./logger')
const { cacheManager } = require('./cache')

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Exporting commands (see module.exports below) because different clients/channels/protocols
 * can choose what actions to implement. Not necessary all actions are needed for
 * REST/Websocket/IRC
 */
const commands = {
  timeAt: '!timeat',
  timePopularity: '!timepopularity'
}

/**
 * @typedef {Object} ParsedMessage
 * @property {string} username - The username part of the message
 * @property {string} message - The whole message, without including the username
 * @property {boolean} isCommand - Indicates if the message is a command or not
 * @property {string} command - The command the user wants to execute
 * @property {string} tz - The timezone extracted from the message
 */

/**
 * Parse a user message an return its content
 * @param {string} msg - Message to be parsed 
 * @returns {ParsedMessage} User message parsed
 */
const parseMessage = (msg = '') => {
  const msgArr = msg.split(': ')
  if (msgArr.length < 2) throw new Error('Error parsing user message')

  const cmdRegex = new RegExp(/^!(timeat|timepopularity)\s/i)
  const isCommand = cmdRegex.test(msgArr[1])
  let tz
  let command

  if (isCommand) {
    const tzRegex = new RegExp(/\S([a-zA-Z0-9\-+]+)((\/([a-z_A-Z0-9\-+]+)){0,3})/g)
    const matchArr = msgArr[1].match(tzRegex)
    command = matchArr[0] ? matchArr[0].toLowerCase() : null
    // Considering the special case of GMT and linking it to Etc/GMT
    const tzSpecialCase = /^GMT/i.test(matchArr[1]) ? `Etc/${matchArr[1]}` : matchArr[1]
    tz = tzSpecialCase ? tzSpecialCase.toLowerCase() : null
  }

  return {
    username: msgArr[0],
    message: msgArr[1],
    isCommand,
    command,
    tz
  }
}

/**
 * Update statistic of tz and prefix
 * A “prefix” is defined as any characters before a / in a tzinfo string.
 * For instance, in America/Chicago, America would be the prefix, while in 
 * America/Argentina/Buenos_Aires, America and America/Argentina would be the prefixes. 
 * Knowing this, a command of !timepopularity America would return the number of 
 * !timeat requests for anywhere in the Americas, and a command of timepopularity
 * America/Argentina would return the number of !timeat requests for anywhere in Argentina.
 * @param {string} tz - Timezone
 * @returns {Promise}
 */
const updatePopularityStats = async tz => {
  try {
    const cache = cacheManager()
    cache.connect()
    logger.debug(`Updating stats for ${tz}`)
    await cache.incr(tz)

    const promiseIncr = []
    while (tz.lastIndexOf('/') !== -1) {
      const lastIndex = tz.lastIndexOf('/')
      // eslint-disable-next-line no-param-reassign
      tz = tz.substr(0, lastIndex)
      logger.debug(`Updating stats for ${tz}`)
      promiseIncr.push(cache.incr(tz))
    }
    await Promise.all(promiseIncr)

    return cache.disconnect()
  } catch (e) {
    logger.error(e)
    throw e
  }
}

/**
 * Get the current time at a location
 * @param {string} tz - Timezone. List of options http://worldtimeapi.org/api/timezone 
 * @returns {string}
 */
const getCurrentTime = async (tz, formatOption = 'D MMM YYYY H:mm') => {
  try {
    const result = await axios.get(`${process.env.TIME_API}/timezone/${tz}`)
    const { data, status } = result
    if (data.length || status !== 200) {
      // When asking for a region instead of a specific location -for instance America-
      // it returns an array of options for that location (http://worldtimeapi.org/api/timezone/America)
      return {
        err: 'unknown timezone'
      }
    }

    // Update stats once we are sure the tz entered by the user is correct
    await updatePopularityStats(tz)
    return {
      err: null,
      time: dayjs(data.datetime).tz(tz).format(formatOption) // format = 9 Jun 2020 13:55
    }
  } catch (e) {
    logger.error(e)
    if (e.response) {
      if (e.response.status === 404) {
        return {
          err: 'unknown timezone'
        }
      }
    }
    throw new Error('Internal server error')
  }
}

/**
 * Get popularity of a timezone in terms off
 * how many times it has been ask for -action !timeat- by users
 * @param {string} tz - Timezone
 * @returns {number}
 */
const getTimePopularity = async tz => {
  try {
    const cache = cacheManager()
    cache.connect()
    const results = await cache.get(tz)
    cache.disconnect()
    return results || 0
  } catch (e) {
    logger.error(e)
    throw e
  }
}

module.exports = {
  parseMessage,
  getCurrentTime,
  getTimePopularity,
  updatePopularityStats,
  commands
}