const express = require('express')
const {  
    registerUser,
    sendOtpForRegisterUser,
    authenticateUser, 
    forgotPassword, 
    resetPassword
} = require('../../controllers/auth')
const { 
    validateRegisterUser, 
    validateAuthUser, 
    validateForgotPassword, 
    validateResetPassword,
    validateSendOtpUser
} = require('./validator')

module.exports = () => {
    const api = express.Router()
    
    api.post('/registerUser', validateRegisterUser, registerUser)
    api.post('/sendOtpForRegisterUser', validateSendOtpUser, sendOtpForRegisterUser)
    
    api.post('/authenticateUser', validateAuthUser, authenticateUser)
    api.post('/forgotPassword', validateForgotPassword, forgotPassword)
    api.post('/resetPassword', validateResetPassword, resetPassword)

    return api
}