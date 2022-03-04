const { groupListService } = require('../../services/groupMaster')
const { successResponse, errorResponse } = require('../../utils/apiResponse')
const { setCustomerObject, 
    findOrCreateCustomerService,
    sanitizeCustomerData,
    getCustomerListService
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

module.exports = {
    getCustomerList,
    addCustomer
}