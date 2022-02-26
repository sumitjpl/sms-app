const express = require("express")
const { sendSMSController } = require('../../controllers/sendSms')
const { verifyToken } = require('../../middleware/authApi')

module.exports = () => {
    const api = express.Router()
    api.post('/sendSms', verifyToken, sendSMSController)
    return api
}