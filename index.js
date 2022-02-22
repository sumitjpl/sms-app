
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const apiResponse = require('./src/utils/apiResponse')
const routes = require('./src/routes/index')

app.use(cors())
app.use(morgan('combined'))
app.use(
  bodyParser.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 1000000
  })
)
app.use(
  bodyParser.json({
    limit: '100mb',
    extended: true
  })
)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
      return res.status(200).json({})
    }
    next()
})

app.use('/api', routes())
app.use('/ping', (req, res, next) => {
    apiResponse.successResponse({
        success: true,
        message: `Sms app api is live`
    }, res)
})

app.use((req, res, next) => {
    apiResponse.errorResponse({
        statusCode: 404,
        error: true,
        message: `Invalid request`
    }, res)
})

const port = process.env.PORT || 4009
app.listen(port, () => {
    console.log(`Sms app server is running on ${port}`)
})