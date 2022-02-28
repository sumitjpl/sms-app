const moment = require('moment')
const groupNameRegex = /^[a-zA-Z-_0-9 ]{1,240}$/ 
const { 
    getGroupMasterModel,
    addGroupModel,
    updateGroupModel
} = require('../model/groupMaster')

const groupListService = async (options) => {
    try {
        const dbResult = await getGroupMasterModel(options)
        return dbResult
    } catch (err) {
        throw err
    }
}

const addGroupService = async (options) => {
    try {
        const { userId, groupName } = options
        if (!userId) {
            throw new Error('user id required')
        }
        if (!groupName) {
            throw new Error('group name required')
        }
        
        if (!groupNameRegex.test(groupName)) {
            throw new Error('Invalid group name. Special chars are not allowed except (_- ).')
        }
      
        const dbResult = await addGroupModel({...setInsertGroupObject({
                            userId,
                            groupName
                        })})
        return dbResult
    } catch (err) {
        throw err
    }
}

const modifyGroupService = async (options) => {
    try {
        const { groupId, groupName, deleted, userId} = options
        if (!groupId) {
            throw new Error('group id required')
        }

        if (!deleted && !groupName) {
            throw new Error('group name required')
        }

        if (!groupNameRegex.test(groupName)) {
            throw new Error('group name must be an alpha_dash')
        }

        const dbResult = await updateGroupModel({...setUpdateGroupObject({
                            userId,
                            groupId,
                            groupName,
                            deleted
                        })})
        return dbResult
    } catch (err) {
        throw err
    }
}

const setInsertGroupObject = ({
    userId,
    groupName
}) => {
    return {
        user_id: userId,
        group_name: groupName,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }
}

const setUpdateGroupObject = ({
    groupId,
    groupName,
    userId,
    deleted =  false
}) => {
    let obj = {
        id: groupId,
        user_id: userId
    }

    if (deleted) {
        obj = { 
            ...obj,
            deleted_at: moment().format("YYYY-MM-DD HH:mm:ss") 
        }
    } else {
        obj = { 
            ...obj,
            group_name: groupName
        }
    }

    return obj
}

module.exports = {
    groupListService,
    addGroupService,
    modifyGroupService,
    setInsertGroupObject,
    setUpdateGroupObject
}