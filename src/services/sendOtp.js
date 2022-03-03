const { generateSaveOtp } = require("../helpers/otp")
const { generateOtp } = require("../utils/commonFunction")
const { sendEmailService } = require("./emailService")
const { emailConfig } = require("./emailTemplates")

const sendOtpService = async ({
    channel,
    otpForService,
    sendOn = ['Email']
}) => {
    try {
        if (!channel) {
            throw new Error('channel is required to send otp.')
        }
        
        const otp =  generateOtp()
        const dbResult = await generateSaveOtp({
            otp,
            channel
        })

        if (sendOn.includes('Email')) {
            await sendEmailService({
                ...emailConfig({
                    type: `OTP`,
                    fromEmail: process.env.FROM_EMAIL_ID,
                    toEmail: channel,
                    otpForService,
                    otp
                })
            })
        }

        return dbResult
    } catch (err) {
        throw err
    }
}

module.exports = {
    sendOtpService
}