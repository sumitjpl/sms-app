const express = require('express')
const { authenticateUser } = require('../../controllers/auth')
const validate = require('./validator')

module.exports = () => {
    const api = express.Router()
    api.post('/authenticateUser', validate, authenticateUser)

    return api
}