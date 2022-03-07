const { successResponse, errorResponse } = require("../../utils/apiResponse")
const { addSmsTemplateService, getSmsTemplateService } = require("./service")

const addSmsTemplate = async (req, res) => {
    try {
        const { authData: { loggedInUserId } } = req
        let { body } = req
        body.created_user_id = loggedInUserId

        const templateList = await addSmsTemplateService(body)
        
        return successResponse({
            message: `Sms template added successfully!`,
            templateList
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const getSmsTemplate = async (req, res) => {
    try {
        const { authData: { loggedInUserId } } = req
        let { body } = req
        body.createdUserId = loggedInUserId
        const templateList = await getSmsTemplateService(body)
        return successResponse({
            templateList
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

module.exports = {
    addSmsTemplate,
    getSmsTemplate
}