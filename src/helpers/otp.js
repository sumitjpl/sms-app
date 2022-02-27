const moment = require('moment')
const { delSertOtpModel, getAndDeleteOtpModel } = require("../model/authOtp")
const appConfig = require('../config/application.json')

const generateSaveOtp = async({
    otp,
    channel
}) => {
    try {   
        const insertObj = setOtp({
            channel,
            otp
        })
        const result = await delSertOtpModel({
                            channel, 
                            insertObj
                        })
        return result
    } catch (err) {
        throw err
    }
}

const setOtp = ({
    channel,
    otp
}) => {

    return {
        channel,
        otp,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        expired_at: moment().add(appConfig.OTP_MAX_EXPIRY_DIGIT, appConfig.OTP_EXPIRY_TYPE).format("YYYY-MM-DD HH:mm:ss")
    }
}

const getAndDeleteOtp = async({ channel, otp }) => {
    try {
        const dbResult = await getAndDeleteOtpModel({
            channel,
            otp
        })

        return dbResult
    } catch (err) {
        throw err
    }
}

module.exports = {
    generateSaveOtp,
    setOtp,
    getAndDeleteOtp
}