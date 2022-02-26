const { getUserModel } = require('../../model/user')

const getUserService = async (options = {}) => {
    try {
        const dbResult = await getUserModel(options)
        return dbResult
    } catch (err) {
        throw err
    }
}

module.exports = {
    getUserService
}