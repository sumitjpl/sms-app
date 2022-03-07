const knex = require('../database/smsApp')
const { tableUser, tableUserProfile, tableUserCred } = require('./smsTable')

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
        password
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

const createUserObjModel = async options => {
    const {
        user_unique_id,
        first_name,
        middle_name,
        last_name,
        emailId: email_id,
        mobile_no,
        created_at,
        created_by,
        user_name,
        status,
        company_name,
        address,
        password,
        is_latest,
        hash_password
    } = options
    return knex.transaction(trx => {
        return trx(tableUser).where('email_id', email_id)
                .then(result => {
                    if (result.length) {
                        throw new Error('Email id already exists!')
                    }
                    return trx(tableUser).insert({
                                user_unique_id,
                                first_name,
                                middle_name,
                                last_name,
                                email_id,
                                mobile_no,
                                created_at,
                                created_by,
                                user_name,
                                status
                            })
                            .then(user => {
                                const [ insertedId ] = user
                                if (insertedId) {
                                    return trx(tableUserProfile).insert({
                                            user_id: insertedId,
                                            company_name,
                                            address,
                                            pin_code,
                                            city,
                                            state,
                                            country
                                        })
                                        .then(() => {
                                            return trx(tableUserCred).insert({
                                                    user_id: insertedId,
                                                    password: hash_password,
                                                    plain_password: password,
                                                    is_latest,
                                                    created_at
                                                })
                                                .then(() => {
                                                    return trx(tableUser).where('id', insertedId)
                                                })
                                    })
                                }
                            })
                })
                .then(trx.commit)
                .catch(trx.rollback)
    })
    .then(resp => resp)
    .catch(err => { throw err })
}

const updateUserModel = async options => {
    const { id = null } = options

    if (!id) {
        throw new Error('id required')
    }

    return knex.transaction(trx => {
        return trx(tableUser).where(`id`, id)
                .then(result => {
                    if (!result.length) {
                        throw new Error('Record not found!')
                    }
                    return trx(tableUser).where('id', id).update(options)
                            .then(() => {
                                return getUserModel()
                            })
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(resp => resp)
            .catch(err => { throw err })
}

module.exports = {
    createUserObjModel,
    getUserModel,
    insertUserCredModel,
    updateUserModel
}