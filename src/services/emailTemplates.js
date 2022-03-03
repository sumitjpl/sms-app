
const emailConfig = options => {
    const {
        type,
        toEmail,
        fromEmail,
        ccList
    } = options
    switch (type) {
        case 'OTP':
            const { otp, otpForService } = options
            return {
                toEmail: toEmail,
                fromEmail: fromEmail,
                cc: ccList || '',
                subject: `One Time Password (OTP) for ${otpForService} on ${process.env.WEB_APP_NAME}`,
                plainMessage: `Your One Time Password (OTP) for ${otpForService} on ${process.env.WEB_APP_NAME} is ${otp}.`,
                htmlMessage: ``
            }
        default:
            return {}
    }
}

module.exports = {
    emailConfig
}