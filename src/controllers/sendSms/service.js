const axios = require("axios")
const uuid = require("uuid")
const moment = require('moment')

const { getSmsTemplateModel } =  require('../../model/smsTemplate')
const { insertSentSmsRecordModel } = require('../../model/sentSmsRecord')
const { SMS_DELIVERY_STATUS } = require('../../constants/appConstant')
const { isValidMobileNo, extractValue } = require('../../utils/commonFunction')
const { getCustomerListModel } = require('../../model/customer')

const AIRTEL_SMS_PUSH_END_POINT = process.env.AIRTEL_SMS_PUSH_END_POINT
const AIRTEL_API_KEYWORD = process.env.AIRTEL_API_KEYWORD
const AIRTEL_API_CAMPAIGN_NAME = process.env.AIRTEL_API_CAMPAIGN_NAME
const AIRTEL_API_CIRCLE_NAME = process.env.AIRTEL_API_CIRCLE_NAME
const AIRTEL_API_USER_NAME = process.env.AIRTEL_API_USER_NAME
const AIRTEL_API_DLT_TM_ID = process.env.AIRTEL_API_DLT_TM_ID
const AIRTEL_API_DLT_PE_ID = process.env.AIRTEL_API_DLT_PE_ID
const AIRTEL_API_CHANNEL = process.env.AIRTEL_API_CHANNEL
const AIRTEL_API_OA = process.env.AIRTEL_API_OA
const AIRTEL_SMS_DELIVERY_URL = process.env.AIRTEL_SMS_DELIVERY_URL

const sendSmsService = async ({
    smsText,
    templateId = null,
    mobileNo = [],
    loggedInUserId = null
}) => {
    try {
        if (!templateId) {
            throw new Error('Select a valid SMS template!')
        }
        const smsTemplate = await getSmsTemplateModel({ operatorTemplateId: templateId })
        if (!smsTemplate.length) {
            throw new Error('Selected template is invalid!')
        }
        const pushObj =  setPushSmsObj({ templateId, mobileNoList: mobileNo, smsText, smsTemplate})
       
        //!~ Send push data to the service provider API
        const response = await sendSmsToEndPoint({ pushObj })
        //!~ Insert records in the sent sms record table
        if (response.status === 200) {
            setTimeout(async () => {
                await createSentSmsTrack({ smsText, loggedInUserId, pushObj })
            }, 0)
        } else {
            throw new Error(response.statusText)
        }

        return response
    } catch (err) {
        throw err
    }
}

const sendSmsToEndPoint = async ({
    pushObj
}) => {
    const pushApiUrl = AIRTEL_SMS_PUSH_END_POINT
    const response = await axios.post(pushApiUrl, pushObj)
    return response
}

const createSentSmsTrack = async ({
    smsText = '', 
    loggedInUserId = null, 
    pushObj = {}
}) => {
    const { timestamp = null, dataSet = [] } = pushObj
    try {
        let sentSmsDbRecord = []
        const smsContentId = moment().unix()
        dataSet.forEach(el => {
            sentSmsDbRecord.push({
                unique_id: el.UNIQUE_ID,
                user_id: loggedInUserId,
                recipient_no: el.MSISDN,
                sms_content_id: smsContentId,
                sent_at: timestamp,
                status: SMS_DELIVERY_STATUS.SENT,
                operator_txn_id: null,
                pushed_obj: JSON.stringify(el)
            })
        })

        if (sentSmsDbRecord.length) {
            await insertSentSmsRecordModel({
                smsContentObj: { id: smsContentId,  sms_content: smsText },
                smsRecordObj: sentSmsDbRecord,
                loggedInUserId
            })
        }
        return true
    } catch (err) {
        throw err
    }
}

const setPushSmsObj = ({
    templateId = null,
    mobileNoList = [], 
    smsText = '',
    smsTemplate
}) => {
    const timestamp = moment().format("YYYYMMDDHHmmss")
    let pushObj = {
        keyword: AIRTEL_API_KEYWORD,
        timestamp,
        dataSet: []
    }
    mobileNoList.forEach(mobileNo => {
        pushObj.dataSet.push({
            ...setPushDataset({
                uniqueId: uuid.v4() ,
                message: smsText,
                mobileNo,
                templateId
        })})
    })
   

    return  pushObj
}

const setPushDataset = ({
    uniqueId,
    message,
    mobileNo,
    templateId
}) => {
    return {
        UNIQUE_ID: uniqueId,
        MESSAGE: message,
        OA: smsTemplate[0].sender_id,
        MSISDN: mobileNo,
        CHANNEL: AIRTEL_API_CHANNEL,
        CAMPAIGN_NAME: AIRTEL_API_CAMPAIGN_NAME,
        CIRCLE_NAME: AIRTEL_API_CIRCLE_NAME,
        USER_NAME: AIRTEL_API_USER_NAME,
        DLT_TM_ID: AIRTEL_API_DLT_TM_ID,
        DLT_CT_ID: templateId,
        DLT_PE_ID: AIRTEL_API_DLT_PE_ID,
        ACTION_RESP_URL: AIRTEL_SMS_DELIVERY_URL
    }
}

const validateMobileNo = (mobileNoList = []) => {
    errorList = []
    mobileList = []
    for (let index = 0; index < mobileNoList.length; index++) {
        const mobileNo = mobileNoList[index];
        let { isValid, message } = isValidMobileNo(mobileNo)
        if (!isValid) {
            errorList.push(`${mobileNo}: ${message}`)
        } else {
            mobileList.push(String(mobileNo))
        }
    }

    return  { errorList, mobileList }
}

const getCustomerByGroupId = async ({
    groupId, 
    customerStatus = [],
    customerGroupMappingStatus = []
}) => {
    try {
        if (!groupId) {
            throw new Error('groupId is required!')
        }
        const result = await getCustomerListModel({ groupId, customerStatus, customerGroupMappingStatus })

        return result
    } catch (err) {
        throw err
    }
}

module.exports = {
    sendSmsService,
    createSentSmsTrack,
    validateMobileNo,
    sendSmsToEndPoint,
    setPushDataset,
    getCustomerByGroupId
}