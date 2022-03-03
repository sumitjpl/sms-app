const express =  require("express")
const { addCustomer, getCustomerList } = require('../../controllers/customer')
const { verifyToken } = require('../../middleware/authApi')
module.exports = () => {
    const api = express.Router()

    api.post("/getCustomerList", verifyToken, getCustomerList)
    api.post("/addCustomer", verifyToken, addCustomer)

    return api
}