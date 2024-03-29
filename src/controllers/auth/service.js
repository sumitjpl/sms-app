const bcrypt = require("bcrypt")
const moment = require("moment") 
const { Country, State, City } =  require("country-state-city")

const { getUserService } = require('../user/service')
const { getAndDeleteOtp } = require('../../helpers/otp')
const { generateToken } = require('../../middleware/authApi')
const { insertUserCredModel, createUserObjModel } = require('../../model/user')
const { deleteAndInsertTokenService } = require('../../utils/token')
const { sendOtpService } = require('../../services/sendOtp')

const getCountryList = async ({ countryCode = '' }) => {
    if (countryCode) {
        return [ Country.getCountryByCode(countryCode) ] || []
    }

    return sortCountryList(Country.getAllCountries()) || []
}

const sortCountryList = (listArr = []) => {
    let result = []
    let indiaObj = {}
    for (const element of listArr) {
        const { isoCode, name, flag } = element
        if (isoCode === 'IN') {
            indiaObj = { ...indiaObj, isoCode, name, flag }
            continue
        }
        result.push({
            isoCode, name, flag
        })
    }

    if (Object.entries(indiaObj).length) {
        result.unshift(indiaObj)
    }

    return result
}

const getStateOfCountryList = async ({
    countryCode = '', 
    stateCode = ''
}) => {
    if (!countryCode) {
        throw new Error('country code is required to get the state list!')
    }

    if (stateCode) {
        return [ State.getStateByCodeAndCountry(stateCode, countryCode) ] || []
    }

    return State.getStatesOfCountry(countryCode) || []
}

const getCitiesOfStateList = async ({
    countryCode = '', 
    stateCode = '',
}) => {
    if (!countryCode ||!stateCode ) {
        throw new Error('country code and state code are required to get the city list!')
    }

    return City.getCitiesOfState(countryCode, stateCode) || []
}

const registerUserService = async options => {
    try {
        const { emailId: channel, otp } =  options
        const isOtpValid = await getAndDeleteOtp({
            channel,
            otp
        })

        if (!isOtpValid) {
            throw new Error(`Invalid otp!`)
        }

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

const sendOtpRegisterUserService = async ({
    emailId
}) => {
    try {
        if (!emailId) {
            throw new Error('Email Id is required!')
        }
        const response = await sendOtpService({
                            channel: emailId,
                            otpForService: `Register User`,
                            sendOn: ['Email']
                        })
        return response
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
        const response = await sendOtpService({
                            channel: email_id,
                            otpForService: `Forgot Password recovery`,
                            sendOn: ['Email']
                        })
        return response
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
    sendOtpRegisterUserService,
    authenticateUserService,
    forgotPasswordService,
    resetPasswordService,
    hashPasswordAsync,
    getCountryList,
    getStateOfCountryList,
    getCitiesOfStateList
}