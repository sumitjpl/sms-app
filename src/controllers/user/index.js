const { getUserService } = require('./service')
const { 
    groupListService,
    addGroupService,
    modifyGroupService
} = require('../../services/groupMaster')
const { errorResponse, successResponse } = require('../../utils/apiResponse')

const getUserDetails = async (req, res) => {
    try {
        const { query: { emailId } } = req
        const [ user ] = await getUserService({emailId})
        return successResponse({
            user
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const groupList = async (req, res) => {
    try {
        const { body } = req
        const dbResult = await groupListService(body)

        return successResponse({
            groupList: dbResult
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const addGroup = async (req, res) => {
    try {
        const { body } = req
        body.userId = req.authData.loggedInUserId
        const dbResult = await addGroupService(body)
        return successResponse({
            message: `Record added successfully!`,
            groupList: dbResult
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const modifyGroup = async (req, res) => {
    try {
        try {
            const { body } = req
            body.userId = req.authData.loggedInUserId
            const dbResult = await modifyGroupService(body)
            return successResponse({
                message: `Record updated successfully!`,
                groupList: dbResult
            }, res)
        } catch (err) {
            return errorResponse({
                statusCode: 500,
                message: err.message
            }, res)
        }
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

module.exports = {
    getUserDetails,
    groupList,
    addGroup,
    modifyGroup
}