const  { validator } = require('../../helpers/validate')
const { errorResponse } = require('../../utils/apiResponse')
const { getUserService } = require('../../controllers/user/service')

const validate = (req, res, next) => {
    try {
        const validateRules = {
            "emailId": "required|email",
            "password": "required|min:6"
        }
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
        const validateRules = {
            "emailId": "required|email",
        }

        validator(req.body, validateRules, {}, async (err, status) => {
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
                                `The email id doesn't exists.`
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

const validateResetPassword = (req, res, next) => {
    const validateRules = {
        "emailId": "required|email",
        "password": "required|min:6",
        "password_confirmation": "required|same:password",
        "otp": "required|digits:6"
    }

    validator(req.body, validateRules, {}, async (err, status) => {
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
                            `The email id doesn't exists.`
                        ]
                    },
                    message: `Validation failed`
                }, res)
            }

            req.foundUser = user
            next()
        }
    }) 
}

module.exports =  { 
    validate,
    validateUser,
    validateResetPassword
}