const  { validator } = require('../../helpers/validate')
const { errorResponse } = require('../../utils/apiResponse')
const { getUserService } = require('../../controllers/user/service')

const validateRegisterUser = (req, res, next) => {
    const validateRules = {
        "emailId": "required|email",
        "first_name": "required|alpha",
        "middle_name": "alpha",
        "last_name": "alpha",
        "mobile_no": "required|indian_mobile",
        "password": "required|min:6|strict",
        "password_confirmation": "required|same:password",
        "company_name": "present",
        "address": "required",
        "city": "required",
        "pin_code": "required|digits:6",
        "state": "required",
        "country": "required",
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
            
            if (user) {
                return errorResponse({
                    statusCode: 412,
                    errors: {
                        emailId: [
                            `The email id already exists.`
                        ]
                    },
                    message: `Validation failed`
                }, res)
            }
            next()
        }
    })  
}

const validateAuthUser = (req, res, next) => {
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

const validateForgotPassword = async (req, res, next) => {
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

const validateSendOtpUser = (req, res, next) => {
    const validateRules = {
        "emailId": "required|email"
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
            
            if (user) {
                return errorResponse({
                    statusCode: 412,
                    errors: {
                        emailId: [
                            `The email id is already exists.`
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
    validateRegisterUser,
    validateAuthUser,
    validateForgotPassword,
    validateResetPassword,
    validateSendOtpUser
}