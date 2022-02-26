const { getUserService } = require('./service')
const { errorResponse, successResponse } = require('../../utils/apiResponse')
const getUserDetails = async (req, res) => {
    try {
        const { query: { emailId } } = req
        const [ user ] = await getUserService({emailId})
        successResponse({
            user
        }, res)
    } catch (err) {
        errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

module.exports = {
    getUserDetails
}