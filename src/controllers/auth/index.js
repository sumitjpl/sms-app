const { successResponse, errorResponse } = require('../../utils/apiResponse')
const  { generateToken } = require('../../middleware/authApi')
const { getUserService } = require('../user/service')
const bcrypt = require('bcrypt')
const { deleteAndInsertTokenService } = require('../../utils/token')

const authenticateUser = async (req, res) => {
    try {
        const { body: { emailId } } = req
        const [ user ] = await getUserService({
            emailId,
            selectCred: true
        })

        if (!user) {
            return errorResponse({
                statusCode: 400,
                message: `Invalid request`
            }, res)
        }
        
        const validPassword =  await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            return errorResponse({
                statusCode: 401,
                message: `Unauthorized access`
            }, res)
        }
        
        const jwtToken = await generateToken(user)
        await deleteAndInsertTokenService({userId: user.id, token: jwtToken})
        return successResponse({
            data: {
                emailId,
                jwtToken
            }
        }, res)
    } catch (err) {
        return errorResponse({
            message: err.message
        }, res)
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { foundUser } = req
    } catch (err) {
        return errorResponse({
            message: err.message
        }, res)
    }
}

const resetPassword = async (req, res) => {

}

module.exports = {
    authenticateUser,
    forgotPassword,
    resetPassword
}