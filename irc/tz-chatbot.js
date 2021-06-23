const irc = require('irc-upd');
const { logger } = require('../utils/logger')
const { processMessage } = require('../services/messages')

module.exports = function () {
  const options = {
    server: process.env.IRC_SERVER || 'irc.freenode.net',
    nick: process.env.IRC_BOT_NICK || 'tz-bot',
    channel: process.env.IRC_CHANNEL ? `#${process.env.IRC_CHANNEL}` : '#tz-testing-bot'
  }
  const client = new irc.Client(options.server, options.nick, {
    channels: [options.channel],
  });

  client.addListener('message', async (from, to, message) => {
    logger.debug(`Message recieved in IRC channel from ${from}`)
    // TODO. Move this parse logic to the parseMessage function
    // This is done this way because the library used for IRC already
    // parse the message for us. I'm recreating the original format
    // <username>: <message> according to requirements
    const msg = `${from}: ${message}`
    try {
      const { err, response, username } = await processMessage(msg)
      if (err) {
        return client.say(options.channel, err)
      }
      if (response) {
        return client.say(options.channel, `${username}: ${response}`)
      }
      return true
    } catch (e) {
      logger.error(e)
      return client.say(options.channel, 'ooops, something went wrong 😭')
    }
  });

  client.addListener('error', (message) => {
    logger.error('Error on IRC channel')
    logger.error(message)
  })
}


