const json2xls = require("json2xls")
const { ADD_CUSTOMER_EXCEL_HEADERS } = require('../../constants/appConstant')
const { groupListService } = require('../../services/groupMaster')
const { successResponse, errorResponse } = require('../../utils/apiResponse')
const { setCustomerObject, 
    findOrCreateCustomerService,
    sanitizeCustomerData,
    getCustomerListService,
    addCustomerBulkService
} = require('./service')

const getCustomerList = async(req, res) => {
    try {
        const { loggedInUserId } = req.authData
        req.body.userId = loggedInUserId
        const dbResult = await getCustomerListService(req.body)
        return successResponse({
                customerList: dbResult
            }, res)
    } catch (err) {
       return  errorResponse({
                message: err.message
            }, res)
    }
}

const addCustomer = async(req, res) => {
    try {
        const { groupId, data } = req.body
        if (!groupId) {
            return errorResponse({
                statusCode: `412`,
                message: `Please select a valid group!`
            }, res)
        }

        const { loggedInUserId } = req.authData
        const [ groupObj ] = await groupListService({
                                groupId,
                                status:[1]
                            })
        if (!groupObj) {
            return errorResponse({
                statusCode: `412`,
                message: `Please select a valid group!`
            }, res)
        }

        if (!Array.isArray(data) || !data.length) {
            return errorResponse({
                    statusCode: `412`,
                    message: `Data list can't be blank`
                }, res)
        }

        const errList = sanitizeCustomerData(data)
        if (errList.length) {
            return errorResponse({
                    errors: errList,
                    statusCode: 412,
                    message: 'Invalid data!'
                }, res)
        }

        let dbObjArr = []

        data.forEach(({
            mobileNumber,
            customerName
        }) => {
            dbObjArr.push({...setCustomerObject({
                mobileNumber,
                customerName,
                loggedInUserId
            })})
        })
        
        const { dbResult, newCreated } = await findOrCreateCustomerService(dbObjArr, groupId)
        return successResponse({
                user: dbResult,
                message: newCreated ? `${newCreated} new record(s) added successfully!` : 'All mobile number(s) already exists.'
            }, res)
    } catch (err) {
       return  errorResponse({
                message: err.message
            }, res)
    }
}

const getCustomerSampleFile = (req, res) => {
    try {
        let headerObj = {}
        const excelFileHeader = ADD_CUSTOMER_EXCEL_HEADERS || []
        for (const iterator of excelFileHeader) {
            headerObj = {...headerObj, [iterator]: ""}
        }
        
        let downloadFileName = `add-customer-sample.xls`
        res.setHeader(`Content-Type`, `application/octet-stream`)
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${downloadFileName};`
        )
        res.end(json2xls([headerObj], {
            fields:{ 
                groupName: "string", 
                mobileNumber: "string", 
                customerName: "string"
            }
        }), 'binary')
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const addCustomerBulk = async(req, res) => {
    try {
        const { authData: { loggedInUserId } } = req
        if (req.file !== undefined) {
            const {  path: filePath } = req.file

            const result =  await addCustomerBulkService({
                                filePath,
                                loggedInUserId
                            })
            const customerList = await getCustomerListService({
                userId: loggedInUserId
            })
            
            return successResponse({
                message: `Record(s) added successfully!`,
                result
            }, res)
        }
        return errorResponse({
            message: `There is some error in the file.`
        }, res)
    } catch (err) {
        return errorResponse({ message: err.message, errorList: err.errorList }, res)
    }
}

module.exports = {
    getCustomerList,
    addCustomer,
    getCustomerSampleFile,
    addCustomerBulk
}