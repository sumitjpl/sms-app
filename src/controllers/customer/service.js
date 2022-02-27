const moment = require('moment')
const { findOrCreateCustomerModel } = require('../../model/customer')
const  { validator } = require('../../helpers/validate')

const sanitizeCustomerData = (dataList = []) => {
    const validateRules = {
        "mobileNumber": "required|indian_mobile",
        "customerName": "required|name"
    }

    try {
        let errList = []
        dataList.map((data, index) => {
            validator(data, validateRules, {}, (err, status) => {
                if (!status) {
                    let { errors: { mobileNumber, customerName } } = err
                    if (mobileNumber) {
                        errList[index] = { mobileNumber: `Row #${index+1}: ${mobileNumber[0]}` }
                    }
                    if (customerName) {
                        errList[index] = { customerName: `Row #${index+1}: ${customerName[0]}` }
                    }
                }
            })
        })

        return errList
    } catch (err) {
        throw err
    }
}

const findOrCreateCustomerService = async (dbObjArr = []) => {
    try {
        if (!dbObjArr.length) {
            return false
        }

        const dbResult = await Promise.all(dbObjArr.map( async dbObj => {
            const [ dbRes ] = await findOrCreateCustomerModel(dbObj)
            return dbRes
        }))
        
        return dbResult
    } catch (err) {
        throw err
    }
}

const setCustomerObject = ({
    mobileNumber,
    customerName,
    loggedInUserId
}) => {
    return {
        mobile_no: mobileNumber,
        name: customerName,
        status: 1,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"), 
        created_user_id: loggedInUserId
    }
}

module.exports = {
    findOrCreateCustomerService,
    setCustomerObject,
    sanitizeCustomerData
}