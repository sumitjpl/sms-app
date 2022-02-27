const { successResponse, errorResponse } = require('../../utils/apiResponse')
const { authenticateUserService, forgotPasswordService, resetPasswordService } = require('./service')

const registerUser = async (req, res) => {}

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
        return successResponse({ result }, res)
    } catch (err) {
        return errorResponse({ message: err.message }, res)
    }
}

module.exports = {
    authenticateUser,
    forgotPassword,
    resetPassword
}