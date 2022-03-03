const { sendSmsService, validateMobileNo } = require('./service')
const { successResponse, errorResponse } =  require('../../utils/apiResponse')

const sendSMSController = async (req, res) => {
    try {
        const { 
            body: { mobileNo = [], templateId = null },
            authData: { loggedInUserId }
        } =  req

        if (!mobileNo.length) {
            return errorResponse({ message: `Mobile number list is empty` }, res)
        }
        
        const mobileNoValidations = validateMobileNo(mobileNo)
        if (Array.isArray(mobileNoValidations) && mobileNoValidations.length) {
            return errorResponse({ message: mobileNoValidations }, res)
        }

        const result = await sendSmsService({
            mobileNo: mobileNo,
            templateId,
            loggedInUserId
        })
        return successResponse({data: result}, res)
    } catch (err) {
        return errorResponse({ message: err.message }, res)
    }
}

const smsDeliveryCallBackController = async (req, res) => {
    
}

module.exports = {
    sendSMSController,
    smsDeliveryCallBackController
}