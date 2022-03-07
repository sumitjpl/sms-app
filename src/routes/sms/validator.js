const  { validator } = require('../../helpers/validate')
const { errorResponse } = require('../../utils/apiResponse')

const validateSmsTemplateData = (req, res, next) => {
    const validateRules = {
        "operator_template_id": "required",
        "template_name": "required",
        "template_body": "required",
        "sender_id": "required",
        "status": "required"
    }

    validator(req.body, validateRules, {}, async (err, status) => {
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
}

module.exports = {
    validateSmsTemplateData
}
