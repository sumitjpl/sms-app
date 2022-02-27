const  { validator } = require('../../helpers/validate')
const { errorResponse } = require('../../utils/apiResponse')
const { getUserService } = require('../../controllers/user/service')

const validateRules = {
    "emailId": "required|email",
    "password": "required|min:6"
}

const validateUserRules = {
    "emailId": "required|email",
}

const validate = (req, res, next) => {
    try {
        validator(req.body, validateRules, {}, (err, status) => {
            if (!status) {
                return errorResponse({
                    statusCode: 412,
                    errors: err.errors,
                    message: `Validation failed`
                }, res)
            } else {
                next()
            }
        })   
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            err,
            message: err.message
        }, res)
    }
}

const validateUser = async (req, res, next) => {
    try {
        validator(req.body, validateUserRules, {}, async (err, status) => {
            if (!status) {
                return errorResponse({
                    statusCode: 412,
                    errors: err.errors,
                    message: `Validation failed`
                }, res)
            } else {
                const [ user ] = await getUserService({
                    emailId: req.body.emailId,
                    status: ['Active']
                })
                
                if (!user) {
                    return errorResponse({
                        statusCode: 412,
                        errors: {
                            emailId: [
                                `The emailId doesn't exists.`
                            ]
                        },
                        message: `Validation failed`
                    }, res)
                }

                req.foundUser = user
                next()
            }
        })   
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            err,
            message: err.message
        }, res)
    }
}

module.exports =  { 
    validate,
    validateUser
}