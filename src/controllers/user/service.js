const moment = require("moment")
const { getUserModel, updateUserModel } = require('../../model/user')

const getUserService = async (options = {}) => {
    try {
        const dbResult = await getUserModel(options)
        return dbResult
    } catch (err) {
        throw err
    }
}

const updateUserService = async options => {
    try {
        const { id, status } = options

        if (!id) {
            throw new Error('Invalid id')
        }

        if (!['Active', 'Inactive'].includes(status)) {
            throw new Error('Invalid status')
        }

        options = {
            ...options,  
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss") 
        }
        
        const dbResult = await updateUserModel(options)
        return dbResult
    } catch (err) {
        throw err
    }
}

module.exports = {
    getUserService,
    updateUserService
}