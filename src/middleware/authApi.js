const jwt = require('jsonwebtoken')
const moment = require('moment')
const { errorResponse } =  require('../utils/apiResponse')
const appConfig = require('../config/application.json')

const generateToken = async (options) => {
    try {
        const { JWT_MAX_EXPIRY_DIGIT, JWT_EXPIRY_TYPE } = appConfig
        const { email_id = '', id } = options || {}
    
        return jwt.sign({
            iat: moment().unix(),
            exp: moment().add(JWT_MAX_EXPIRY_DIGIT, JWT_EXPIRY_TYPE).unix(),
            data: {
                loggedInUserId: id,
                emailId: email_id
            }
        }, process.env.JWT_SECRET)
    } catch (err) {
        throw err
    }
}

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            errorResponse({ statusCode: 401, message: 'Access denied!, unauthorized user' }, res)
        }
        const secret = `${process.env.JWT_SECRET}`
        const jwtObj = await jwt.verify(token, secret)
        const { data: { loggedInUserId } } = jwtObj
        
        req.authData = { loggedInUserId }
        next()
    } catch (err) {
        errorResponse({ statusCode: 401, message: err.message }, res)
    }
}

const expireToken = async(req, res, next) => {

}

module.exports = {
    generateToken,
    verifyToken,
    expireToken
}