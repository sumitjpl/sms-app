const bcrypt = require('bcrypt')
const moment = require('moment') 

const { getUserService } = require('../user/service')
const { generateSaveOtp, getAndDeleteOtp } = require("../../helpers/otp")
const { generateToken } = require('../../middleware/authApi')
const { insertUserCredModel, createUserObjModel } = require('../../model/user')
const { sendEmailService } = require("../../services/emailService")
const { generateOtp } = require("../../utils/commonFunction")
const { deleteAndInsertTokenService } = require('../../utils/token')

const registerUserService = async options => {
    try {
        options = { 
            ...options,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            is_latest: true,
            hash_password: await hashPasswordAsync(options.password)
        }
        const dbResult = await createUserObjModel(options)
        return dbResult   
    } catch (err) {
        throw err
    }
}

const authenticateUserService = async options => {
    try {
        const { body: { emailId } } = options
        if (!emailId) {
            let err  = new Error(`Invalid request`)
            err.statusCode =  400
            throw err
        }

        const [ user ] = await getUserService({
            emailId,
            selectCred: true,
            isLatest: true
        })
        if (!user) {
            let err  = new Error(`Invalid request`)
            err.statusCode =  400
            throw err
        }
        
        const validPassword =  await bcrypt.compare(options.body.password, user.password)
        if (!validPassword) {
            let err  = new Error(`Unauthorized access`)
            err.statusCode =  401
            throw err
        }
        
        const jwtToken = await generateToken(user)
        await deleteAndInsertTokenService({userId: user.id, token: jwtToken})

        return jwtToken
    } catch (err) {
        throw err
    }
}

const forgotPasswordService = async ({
    user
}) => {
    try {
        const { email_id } = user
        const otp = generateOtp()
        const dbResult = await generateSaveOtp({
            otp,
            channel: email_id
        })

        await sendEmailService({
            fromEmail: process.env.FROM_EMAIL_ID,
            toEmail: email_id,
            subject: `One Time Password (OTP) for Forgot Password recovery on ${process.env.WEB_APP_NAME}`,
            plainMessage: `Your One Time Password (OTP) for Forgot Password recovery on ${process.env.WEB_APP_NAME} is ${otp}.`
        })
        return dbResult
    } catch (err) {
        throw err
    }
}

const resetPasswordService = async({
    channel,
    otp,
    password,
    foundUser
}) => {
    try {
        const isOtpValid = await getAndDeleteOtp({
                            channel,
                            otp
                        })
        if (!isOtpValid) {
            throw new Error(`Invalid otp!`)
        }
        const hash = await hashPasswordAsync(password)
        const dbResult = await insertUserCredModel({ 
            user_id: foundUser.id,
            plain_password: password,
            password: hash,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss')
        })
        return dbResult
    } catch (err) {
        throw err
    }
}

const hashPasswordAsync = async password => {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)

    return hash
}

module.exports = {
    registerUserService,
    authenticateUserService,
    forgotPasswordService,
    resetPasswordService,
    hashPasswordAsync
}