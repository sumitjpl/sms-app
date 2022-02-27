const knex = require('../database/smsApp')
const { tableAuthOtp } = require('./smsTable')

const delSertOtpModel = async ({
    channel,
    insertObj
}) => {
    if (!channel) {
        throw new Error('Parameter missing!')
    }

    if (Object.entries(insertObj).length) {
        const { otp, created_at, expired_at } = insertObj

        if (!otp) {
            throw new Error('otp not found!')
        }

        if (!created_at) {
            throw new Error('otp creation timestamp is missing!')
        }

        if (!expired_at) {
            throw new Error('otp expiry timestamp is missing!')
        }
    }

    return knex.transaction(trx => {
        return trx(tableAuthOtp).where('channel', channel).del()
                .then(result => {
                    if (Object.entries(insertObj).length) {
                        return trx(tableAuthOtp).insert(insertObj)
                    }
                    return false
                })
                .then(trx.commit)
                .catch(trx.rollback)
    })
    .then(resp => resp)
    .catch(err =>  { throw err })
}

const getAndDeleteOtpModel = async({
    channel,
    otp
}) => {
    if (!channel || !otp) {
        throw new Error('Otp and channel required!')
    }

    const result = knex.transaction(trx => {
                    return trx(tableAuthOtp).where('channel', channel).where('otp', otp)
                            .then(result => {
                                if (!result.length) {
                                    return false
                                }
                                return trx(tableAuthOtp).where('id', result[0].id).del()
                            })
                            .then(trx.commit)
                            .catch(trx.rollback)
                })
                .then(resp => resp)
                .catch(err => { throw err })

    return result
}

module.exports = {
    delSertOtpModel,
    getAndDeleteOtpModel
}