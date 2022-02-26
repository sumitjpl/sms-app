const express =  require("express")
const { addCustomer } = require('../../controllers/customer')
const { verifyToken } = require('../../middleware/authApi')
module.exports = () => {
    const api = express.Router()
    api.post("/addCustomer", verifyToken, addCustomer)

    return api
}