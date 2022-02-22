const axios = require('axios')
const appConfig = require('../../config/application.json')

const sendSmsService = async (options = {}) => {
    try {
        let { smsText = '', mobileNo = [], from = '' } = options

        if (smsText === '' || !mobileNo.length) {
            throw Error('All the parameters are required to send sms!')
        }
        
        from = process.env.SENDER_FROM

        let recipients = mobileNo.length > 1 ? encodeURI(mobileNo.join(" ")) : mobileNo[0]
        let url = `${appConfig.SMS_API_BASE_URL}${appConfig.SMS_API_END_POINTS.PUSH_SMS}`
        let params = `?accesskey=${process.env.SMS_ACCESS_KEY}&to=${recipients}&text=${smsText}&from=${from}&dlrurl=${appConfig.SMS_DELIVERY_URL}`

        return `${url}${params}`
        const result = await axios.get(`${url}${params}`)

        return result
    } catch (err) {
        throw err
    }
}

module.exports = {
    sendSmsService
}