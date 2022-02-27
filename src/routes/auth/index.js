const express = require('express')
const { authenticateUser, forgotPassword, resetPassword } = require('../../controllers/auth')
const { validate, validateUser } = require('./validator')

module.exports = () => {
    const api = express.Router()
    api.post('/authenticateUser', validate, authenticateUser)
    api.post('/forgotPassword', validateUser, forgotPassword)

    return api
}