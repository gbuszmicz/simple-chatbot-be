const express = require('express')
const messages = require('./messages')
const healthCheck = require('./health-check')

const router = express.Router()

router.use('/messages', messages)
router.use('/health', healthCheck)

module.exports.routes = router
