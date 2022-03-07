const express = require("express")
const { sendSMSController, smsDeliveryCallBackController } = require('../../controllers/sendSms')
const { addSmsTemplate, getSmsTemplate } = require("../../controllers/smsTemplates")
const { verifyToken } = require('../../middleware/authApi')
const { validateSmsTemplateData } = require("./validator")

module.exports = () => {
    const api = express.Router()

    api.post('/sendSms', verifyToken, sendSMSController)
    api.post('/smsDeliveryCallBack', verifyToken, smsDeliveryCallBackController)
    api.post('/addSmsTemplate', verifyToken, validateSmsTemplateData, addSmsTemplate)
    api.get('/getSmsTemplate', verifyToken, getSmsTemplate)

    return api
}