const { successResponse, errorResponse } = require('../../utils/apiResponse')
const { 
    registerUserService,
    authenticateUserService, 
    forgotPasswordService, 
    resetPasswordService,
    sendOtpRegisterUserService
} = require('./service')

const sendOtpForRegisterUser = async (req, res) => {
    try {
        await sendOtpRegisterUserService({
            emailId: req.body.emailId
        })
        return successResponse({ message: `Otp sent successfully!` }, res)
    } catch (err) {
        return errorResponse({message: err.message}, res)
    }
}

const registerUser = async (req, res) => {
    try {
        const dbResult = await registerUserService(req.body)
        return successResponse({ message: `User created successfully!`, user: dbResult }, res)
    } catch (err) {
        return errorResponse({message: err.message}, res)
    }
}

const authenticateUser = async (req, res) => {
    try {
        const jwtToken = await authenticateUserService(req)
        return successResponse({
            data: {
                emailId: req.body.emailId,
                jwtToken
            }
        }, res)
    } catch (err) {
        return errorResponse({
            message: err.message,
            statusCode: err.statusCode
        }, res)
    }
}

const forgotPassword = (req, res) => {
    try {
        const { foundUser } = req
        setTimeout(() => {
            forgotPasswordService({
                user: foundUser
            })
        }, 0)

        return successResponse({
            data: {
                message: `Otp sent!`
            }
        }, res)
    } catch (err) {
        return errorResponse({
            message: err.message
        }, res)
    }
}

const resetPassword = async (req, res) => {
    try {
        const { body: {
            emailId,
            password,
            otp
            },
            foundUser
        } = req
        const result = await resetPasswordService({
                        channel: emailId,
                        otp,
                        password,
                        foundUser
                    })
        return successResponse({ message: `Password reset successfully!` }, res)
    } catch (err) {
        return errorResponse({ message: err.message }, res)
    }
}

module.exports = {
    registerUser,
    sendOtpForRegisterUser,
    authenticateUser,
    forgotPassword,
    resetPassword
}