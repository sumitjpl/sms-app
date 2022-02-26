const { successResponse, errorResponse } = require('../../utils/apiResponse')
const { setCustomerObject, 
    findOrCreateCustomerService,
    sanitizeCustomerData
} = require('./service')

const addCustomer = async(req, res, next) => {
    try {
        const { data } = req.body
        if (!Array.isArray(data) || !data.length) {
            errorResponse({
                statusCode: `412`,
                message: `Data list can't be blank`
            }, res)
        }

        const errList = sanitizeCustomerData(data)
        if (errList.length) {
            errorResponse({
                errors: errList,
                statusCode: 412,
                message: 'Invalid data!'
            }, res)
        }

        const { loggedInUserId } = req.authData
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
        
        const dbResult = await findOrCreateCustomerService(dbObjArr)
        successResponse({
            user: dbResult,
            message: 'customer added successfully!'
        }, res)
    } catch (err) {
        errorResponse({
            message: err.message
        }, res)
    }
}

module.exports = {
    addCustomer
}