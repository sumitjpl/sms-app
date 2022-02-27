const moment = require('moment')
const { getLoggedInTokenModel, delSertTokenModel } = require('../model/userToken')

const deleteAndInsertTokenService = async ({
    userId,
    token
}) => {
    try {
        if (!userId || !token) {
            throw new Error('Token and user id missing!')
        }

        const dbResult = await delSertTokenModel({
                        userId,
                        token,
                        createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
                    })
       
        return dbResult
    } catch (err) {
        throw err
    }
}

const getUserTokenService = async ({ userId, token }) => {
    try {
        if (!userId && !token) {
            throw new Error('User id or token required!')
        }
        const dbResult = await getLoggedInTokenModel({ userId, token })
        return dbResult
    } catch (err) {
        throw err
    }
}

module.exports = {
    getUserTokenService,
    deleteAndInsertTokenService
}