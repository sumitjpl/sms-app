const moment = require('moment')
const fs = require("fs")
const { findOrCreateCustomerModel, addCustomerGroupMappingModel, getCustomerListModel } = require('../../model/customer')
const  { validator } = require('../../helpers/validate')
const { parseExcelFileToJson } = require('../../helpers/parseFile')
const { ADD_CUSTOMER_EXCEL_HEADERS } = require('../../constants/appConstant')
const { extractValue, setKeyValueHash } = require('../../utils/commonFunction')
const { groupListService } = require('../../services/groupMaster')

const sanitizeCustomerData = (dataList = [], bulkAdd = false) => {
    let validateRules = {
        "mobileNumber": "required|indian_mobile",
        "customerName": "required|name"
    }
    if (bulkAdd) {
        validateRules = {...validateRules, groupName: "required|group_name"}
    }

    try {
        let errList = []
        dataList.map((data, index) => {
            validator(data, validateRules, {}, (err, status) => {
                if (!status) {
                    let { errors: { mobileNumber, customerName, groupName = null } } = err
                    if (mobileNumber) {
                        errList[index] = { mobileNumber: `Row #${index+1}: ${mobileNumber[0]}` }
                    }
                    if (customerName) {
                        errList[index] = { customerName: `Row #${index+1}: ${customerName[0]}` }
                    }
                    if (groupName) {
                        errList[index] = { groupName: `Row #${index+1}: ${groupName[0]}` }
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

const addCustomerBulkService = async ({
    filePath,
    loggedInUserId
}) => {
    try {
        if (!filePath) {
            throw new Error('File path not defined!')
        }

        const jsonData =  parseExcelFileToJson({ filePath }) || []
        if (process.env.NODE_ENV === 'local') {
            fs.unlinkSync(filePath)
        }

        if (!jsonData.length) {
            throw new Error('Data not found in the excel file!')
        }

        const jsonHeaders = Object.keys(jsonData[0])
        let difference = jsonHeaders.filter(x => !ADD_CUSTOMER_EXCEL_HEADERS .includes(x))
        if (difference.length) {
            throw new Error(`Unknown column name(s) found - ${difference.join(",")}`)
        }
       
        let errList = sanitizeCustomerData(jsonData, true)
        if (errList.length) {
            let err = new Error(`Some error found in the data!`)
            err.errorList = errList
            throw err
        }
    
        const groupNames = extractValue(jsonData, 'groupName')
        const dbGroupList =  await groupListService({
                                groupName: groupNames,
                                userId: loggedInUserId,
                                status: 1
                            })
        
        if (!dbGroupList.length) {
            throw new Error(`Invalid group names - ${groupNames.join(",")}`)
        }
        const dbGroupNames = extractValue(dbGroupList, 'group_name')
        difference = groupNames.filter(x => !dbGroupNames .includes(x))
        if (difference.length) {
            throw new Error(`Unknown group name(s) found - ${difference.join(",")}`)
        }

        let mobileNumbers = extractValue(jsonData, 'mobileNumber')
        let uniqueMobileNos = [...new Set(mobileNumbers)]
        if (mobileNumbers.length !== uniqueMobileNos.length) {
            throw new Error(`There is some duplicate mobile number(s) found in the file.`)
        }
        const dbCustomerList =  await getCustomerListService({ 
                                userId:loggedInUserId,
                                mobileNo:uniqueMobileNos,
                                customerStatus: [1],
                                customerGroupMappingStatus: [1]
                            })
        const dbMobileNos = extractValue(dbCustomerList, 'mobile_no')
        if (dbMobileNos.length) {
            throw new Error(`Mobile number(s) already exists in the system - ${dbMobileNos.join(",")}`)
        }
        
        const groupNameHash = setKeyValueHash({
                                    list: dbGroupList, 
                                    keyIndex:'group_name', 
                                    valueIndex: 'id'
                                })
        return {groupNameHash, dbGroupList, groupNames}
    } catch (err) {
        throw err
    }
}

module.exports = {
    getCustomerListService,
    findOrCreateCustomerService,
    setCustomerObject,
    sanitizeCustomerData,
    addCustomerBulkService
}