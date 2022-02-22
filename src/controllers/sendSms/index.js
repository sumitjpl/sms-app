const { sendSmsService } = require('./service')
const { successResponse, errorResponse } =  require('../../utils/apiResponse')

const sendSMSController = async (req, res, next) => {
    try {
        const { body: { mobileNo, smsText }} =  req
        const result = await sendSmsService({
            mobileNo: [mobileNo],
            smsText
        })
        successResponse({data: result}, res)
    } catch (err) {
        errorResponse({ message: err.message }, res)
    }
}

module.exports = {
    sendSMSController
}