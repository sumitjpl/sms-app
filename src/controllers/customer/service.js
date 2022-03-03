const moment = require('moment')
const { findOrCreateCustomerModel, addCustomerGroupMappingModel, getCustomerListModel } = require('../../model/customer')
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

const findOrCreateCustomerService = async (dbObjArr = [], groupId) => {
    try {
        if (!dbObjArr.length) {
            return false
        }

        let newCreated = 0
        let timestamp =   moment().format("YYYY-MM-DD HH:mm:ss")
        const dbResult = await Promise.all(dbObjArr.map( async dbObj => {
            const { mobile_no } = dbObj
            const [ dbRes ] = await findOrCreateCustomerModel(dbObj)
            
            if (typeof dbRes[mobile_no] === 'object') {
                newCreated++
                if (groupId) {
                    console.log(groupId, setCustomerGroupMappingObject({
                        customerId: dbRes[mobile_no].id,
                        groupId,
                        timestamp
                    }))

                    await addCustomerGroupMappingModel({
                        ...setCustomerGroupMappingObject({
                            customerId: dbRes[mobile_no].id,
                            groupId,
                            timestamp
                        })
                    })
                }
            }
            return dbRes
        }))
        
        return  { dbResult, newCreated }
    } catch (err) {
        throw err
    }
}

const setCustomerGroupMappingObject = ({
    customerId,
    groupId,
    timestamp
}) => {
    return {
        customer_id: customerId,
        group_id: groupId,
        created_at: timestamp
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

const getCustomerListService = async ({
    userId,
    customerId,
    groupId,
    mobileNo,
    customerStatus = [],
    customerGroupMappingStatus = []
}) => {
    if (!userId && !customerId && !groupId && !mobileNo) {
        throw new Error('At least one filter is required among (user, customer, group, mobile no)')
    }
    const dbResult = await getCustomerListModel({
        userId,
        customerId,
        groupId,
        mobileNo,
        customerStatus,
        customerGroupMappingStatus
    })

    return dbResult
}

module.exports = {
    getCustomerListService,
    findOrCreateCustomerService,
    setCustomerObject,
    sanitizeCustomerData
}