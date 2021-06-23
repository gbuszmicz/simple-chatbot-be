const express = require('express')
const helmet = require('helmet')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const { routes } = require('./routes')
const { loggerMiddleware } = require('./utils/logger')

const app = express();

app.use(cors())
app.use(helmet())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(loggerMiddleware)

// Log all request
app.use((req, res, next) => {
  req.log.info(
    `method=${req.method} path=${req.path} status=${res.statusCode}`
  );
  next()
});

// v1 api routes
app.use('/api/v1', routes)

module.exports = app
