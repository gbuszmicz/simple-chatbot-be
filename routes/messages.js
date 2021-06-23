const express = require('express')
const { processMessage } = require('../services/messages')
const { logger } = require('../utils/logger')

const router = express.Router()

router.post('/', async (req, res) => {
  const { msg } = req.body
  try {
    const { err, response } = await processMessage(msg)
    // If it's not a command echo the user's message
    // This behavior is just for Web
    return res.status(200).send(err || response)
  } catch (e) {
    logger.error(e)
    return res.status(500).send('Error processing message')
  }
})

module.exports = router