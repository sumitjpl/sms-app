const express = require('express')
const { getUserDetails } = require('../../controllers/user')
const { verifyToken } = require('../../middleware/authApi')

module.exports = () => {
    const api = express.Router()
    api.get('/getUser', verifyToken, getUserDetails)
    return api
}