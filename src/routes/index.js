const express = require('express')
const user = require('./user')
const auth = require('./auth')
const customer = require('./customer')
const sms = require('./sms')

module.exports = () => {
  const api = express.Router()
  api.use('/auth', auth())

  api.use('/user', user())
  api.use('/customer', customer())
  api.use('/sms', sms())
  
  return api
}
