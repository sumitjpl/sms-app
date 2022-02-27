const knex = require('../database/smsApp')
const { tableUserToken } = require('./smsTable')

const getLoggedInTokenModel = async ({
    userId,
    token
}) => {
    const sql = knex(tableUserToken).select()

    if (userId) {
        sql.where('user_id', userId)
    }

    if (token) {
        sql.where('token', token)
    }

    return sql
}

const delSertModel = async ({
    userId,
    token,
    createdAt
}) => {
    if (!userId || !token) {
        throw new Error('user id and token are required!')
    }

    return knex.transaction(trx => {
        return trx(tableUserToken).where('user_id', userId).del()
                .then(result => {
                    return trx(tableUserToken).insert({
                        user_id: userId,
                        token,
                        created_at: createdAt 
                    })
                })
                .then(trx.commit)
                .catch(trx.rollback)
    })
    .then(resp => true)
    .catch(err =>  { throw err })
}

module.exports = {
    getLoggedInTokenModel,
    delSertModel
}