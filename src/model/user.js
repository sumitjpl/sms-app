const knex = require('../database/smsApp')
const { tableUser, tableUserCred } = require('./smsTable')

const getUserModel = async (options = {}) => {
    try {
        const { emailId = '', selectCred = false, status = [] } = options
        const sql = knex(`${tableUser} as u`).select(['u.*'])

        if (selectCred) {
            sql.select('uc.password')
            sql.join(`${tableUserCred} as uc`, 'uc.user_id', 'u.id')
        }

        if (emailId) {
            sql.where(`u.email_id`, emailId)
        }

        if (status.length) {
            sql.whereIn(`u.status`, status)
        }

        return sql
    } catch (err) {
        throw err
    }
}

module.exports = {
    getUserModel
}