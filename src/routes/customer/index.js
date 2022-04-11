const express =  require("express")
const { addCustomer, getCustomerList, addCustomerBulk, getCustomerSampleFile } = require('../../controllers/customer')
const { verifyToken } = require('../../middleware/authApi')
const { uploadExcelFile } = require("../../middleware/uploadFile")
module.exports = () => {
    const api = express.Router()

    api.post("/getCustomerList", verifyToken, getCustomerList)
    api.post("/addCustomer", verifyToken, addCustomer)
    api.get('/getCustomerSampleFile', getCustomerSampleFile)
    api.post("/addCustomerBulk", verifyToken, uploadExcelFile, addCustomerBulk)

    return api
}