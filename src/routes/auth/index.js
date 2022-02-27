const express = require('express')
const {  
    authenticateUser, 
    forgotPassword, 
    resetPassword 
} = require('../../controllers/auth')
const { validate, validateUser, validateResetPassword } = require('./validator')

module.exports = () => {
    const api = express.Router()
    
    api.post('/authenticateUser', validate, authenticateUser)
    api.post('/forgotPassword', validateUser, forgotPassword)
    api.post('/resetPassword', validateResetPassword, resetPassword)

    return api
}