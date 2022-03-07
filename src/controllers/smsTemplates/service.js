
const moment = require("moment")
const appConfig = require('../../config/application.json')
const { addSmsTemplateModel, getSmsTemplateModel } = require('../../model/smsTemplate')

const addSmsTemplateService = async (options) => {
    try {
        const { created_user_id } = options

        if (!created_user_id) {
            throw new Error('Logged in user not found!')
        }

        const dbResult = await addSmsTemplateModel({
            ...setSmsTemplateObj(options)
        })
        return dbResult
    } catch (err) {
        throw err
    }
}

const setSmsTemplateObj = (options) => {
    return {
        ...options,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        status: appConfig.SMS_TEMPLATE_STATUS.APPROVED_BY_OPERATOR
    }
}

const getSmsTemplateService = async (options) => {
    try {
        const dbResult = await getSmsTemplateModel(options)
        return dbResult
    } catch (err) {
        throw err
    }
}

module.exports = {
    addSmsTemplateService,
    setSmsTemplateObj,
    getSmsTemplateService
}