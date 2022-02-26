const validator = require('../../helpers/validate')
const { errorResponse } = require('../../utils/apiResponse')

const validateRules = {
    "emailId": "required|email",
    "password": "required|min:6"
}

const validate = (req, res, next) => {
    try {
        validator(req.body, validateRules, {}, (err, status) => {
            if (!status) {
                errorResponse({
                    statusCode: 412,
                    errors: err.errors,
                    message: `Validation failed`
                }, res)
            } else {
                next()
            }
        })   
    } catch (err) {
        errorResponse({
            statusCode: 500,
            err,
            message: err.message
        }, res)
    }
}

module.exports = validate