const express = require("express")
const { sendSMSController, smsDeliveryCallBackController } = require('../../controllers/sendSms')
const { 
    addSmsTemplate, 
    getSmsTemplate, 
    getTemplateSampleFile,
    addSmsTemplateBulk
} = require("../../controllers/smsTemplates")

const { verifyToken } = require('../../middleware/authApi')
const { validateSmsTemplateData } = require("./validator")

const { uploadExcelFile } = require('../../middleware/uploadFile')

module.exports = () => {
    const api = express.Router()

    api.post('/sendSms', verifyToken, sendSMSController)
    api.post('/smsDeliveryCallBack', verifyToken, smsDeliveryCallBackController)
    api.post('/addSmsTemplate', verifyToken, validateSmsTemplateData, addSmsTemplate)
    api.get('/getSmsTemplate', verifyToken, getSmsTemplate)
    api.get('/getTemplateSampleFile', getTemplateSampleFile)
    api.post('/addSmsTemplateBulk', verifyToken, uploadExcelFile, addSmsTemplateBulk)

    return api
}