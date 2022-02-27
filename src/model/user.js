const knex = require('../database/smsApp')
const { tableUser, tableUserCred } = require('./smsTable')

const getUserModel = async (options = {}) => {
    try {
        const { 
            emailId = '', 
            selectCred = false, 
            status = [], 
            isLatest 
        } = options

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

        if (isLatest !== undefined) {
            sql.where(`uc.is_latest`, isLatest)
        }

        return sql
    } catch (err) {
        throw err
    }
}

const insertUserCredModel = async insertObj => {
    const { 
        user_id,
        password,
        created_by,
        plain_password
    } = insertObj

    if (!user_id) {
        throw new Error('User id required!')
    }
    if (!password) {
        throw new Error('password required!')
    }


    return knex.transaction(trx => {
        return trx(tableUserCred).where('user_id', user_id).update({ is_latest: 0 })
                .then(() => {
                    return trx(tableUserCred).insert(insertObj)
                })
                .then(trx.commit)
                .catch(trx.rollback)
    })
    .then(resp => resp)
    .catch(err => { throw err })
}

module.exports = {
    getUserModel,
    insertUserCredModel
}