const { sendSmsService, validateMobileNo, getCustomerByGroupId } = require('./service')
const { successResponse, errorResponse } =  require('../../utils/apiResponse')
const { extractValue, arrayUnique } = require('../../utils/commonFunction')

const sendSMSController = async (req, res) => {
    try {
        let { 
            authData: { loggedInUserId },
            body: { 
                templateId = null,
                mobileNo = [], 
                smsText = '',
                groupId = null
            }
        } =  req

        if (!mobileNo.length && !groupId) {
            return errorResponse({ message: `Select a valid group or provide list of mobile no(s).` }, res)
        }

        if (mobileNo.length && !Array.isArray(mobileNo)) {
            return errorResponse({ message: `mobileNo param must be a list of array.` }, res)
        }

        if (mobileNo.length) {
            const { errorList, mobileList } = validateMobileNo(mobileNo)
            if (Array.isArray(errorList) && errorList.length) {
                return errorResponse({ message: errorList }, res)
            }
            mobileNo = mobileList
        }
        
        if (groupId) {
            const customerList = await getCustomerByGroupId({ 
                                    groupId,
                                    customerStatus: [1],
                                    customerGroupMappingStatus: [1]
                                })
            const groupMobileNoList = extractValue(customerList, 'mobile_no')
            if (!groupMobileNoList.length) {
                return errorResponse({ message: `Selected group is empty.` }, res)
            }
            
            if (mobileNo.length) {
                mobileNo = mobileNo.concat(groupMobileNoList)
            } else {
                mobileNo = groupMobileNoList
            }
        }
       
        const result = await sendSmsService({
                            mobileNo: arrayUnique(mobileNo),
                            smsText,
                            templateId,
                            loggedInUserId
                        })
        return successResponse({ data: result }, res)
    } catch (err) {
        return errorResponse({ message: err.message }, res)
    }
}

const smsDeliveryCallBackController = async (req, res) => {
    try {
        const { Response = null } = req.body
        if (Response) {
            const { ClientTxnId } = Response
        }
    } catch (err) {
        return errorResponse({ message: err.message }, res)
    }
}

module.exports = {
    sendSMSController,
    smsDeliveryCallBackController
}