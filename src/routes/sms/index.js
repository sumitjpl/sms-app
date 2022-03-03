const express = require("express")
const { sendSMSController, smsDeliveryCallBackController } = require('../../controllers/sendSms')
const { verifyToken } = require('../../middleware/authApi')

module.exports = () => {
    const api = express.Router()
    api.post('/sendSms', verifyToken, sendSMSController)
    api.post('/smsDeliveryCallBack', verifyToken, smsDeliveryCallBackController)
    return api
}