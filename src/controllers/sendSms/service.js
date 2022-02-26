const axios = require('axios')
const moment = require('moment')

const appConfig = require('../../config/application.json')
const { getSmsTemplateModel } =  require('../../model/smsTemplate')
const { insertSentSmsRecord } = require('../../model/sentSmsRecord')
const { SMS_DELIVERY_STATUS, OPERATOR_STATUS_CODE } = require('../../constants/appConstant')
const { isValidMobileNo } = require('../../utils/commonFunction')

const sendSmsService = async (options = {}) => {
    try {
        let { templateId = '', mobileNo = [], loggedInUserId } = options
        if (templateId === '' || !mobileNo.length) {
            throw Error('All the parameters are required to send sms!')
        }

        const smsTemplate = await getSmsTemplateModel({
                                operatorTemplateId: templateId
                            })

        if (!smsTemplate.length) {
            throw Error('Invalid template!')
        }

        const [{ template_body, sender_id, operator_template_id }] = smsTemplate

        let smsText = String(template_body)
                        .replace('{#var_1#}', 'Test')
                        .replace('{#var_2#}', 'Test')
                        .replace('{#var_3#}', 'Test')
                        .replace('{#var_4#}', 'Test')

        let recipients = mobileNo.length > 1 ? encodeURI(mobileNo.join(" ")) : mobileNo[0]
        let url = `${appConfig.SMS_API_BASE_URL}${appConfig.SMS_API_END_POINTS.PUSH_SMS}`
        let params = `?accesskey=${process.env.SMS_ACCESS_KEY}&to=${recipients}&text=${smsText}&from=${sender_id}&tid=${operator_template_id}&dlrurl=${appConfig.SMS_DELIVERY_URL}`
        
        const { status, data } = await axios.get(`${url}${params}`, {validateStatus: () => true})
        
        if (status === 200 && data.status === 'success') {
            const { message } = data
            const res = await createSentSmsTrack({
                message,
                smsText,
                loggedInUserId
            })
        }

        return { status, message: OPERATOR_STATUS_CODE[status] }
    } catch (err) {
        throw err
    }
}

const createSentSmsTrack = async (options) => {
    const { message = [], smsText = '', loggedInUserId } = options
    if (!message.length) {
        throw Error(`Response object doesn't have message!`)
    }

    if (smsText === '') {
        throw Error(`Sms content is empty!`)
    }

    if (!loggedInUserId) {
        throw Error(`Logged in user not found!`)
    }

    try {
        const smsContentId = moment().unix()
        const res =  await insertSentSmsRecord({
            smsContentObj: { id: smsContentId,  sms_content: smsText },
            smsRecordObj: setSentSmsObj(message, loggedInUserId, smsContentId),
            loggedInUserId
        })

        return res
    } catch (err) {
        throw err
    }
}

const setSentSmsObj = (message = [], loggedInUserId, smsContentId) => {
    let timestamp = moment().format("YYYYMMDDHHmmss")
    let result = []
    message.forEach(el => {
        let key = [Object.keys(el)]
        result.push({
            unique_id: `SMS/${loggedInUserId}/${timestamp}`,
            user_id: loggedInUserId,
            recipient_no: key,
            sms_content_id: smsContentId,
            sent_at: timestamp,
            status: SMS_DELIVERY_STATUS.SENT,
            operator_txn_id: el[key]
        })
    })

    return result
}

const validateMobileNo = (mobileNoList = []) => {
    errorList = []
    for (let index = 0; index < mobileNoList.length; index++) {
        const mobileNo = mobileNoList[index];
        let { isValid, message } = isValidMobileNo(mobileNo)
        if (!isValid) {
            errorList.push(`${mobileNo}: ${message}`)
        }
    }

    return errorList
}

module.exports = {
    sendSmsService,
    createSentSmsTrack,
    validateMobileNo
}