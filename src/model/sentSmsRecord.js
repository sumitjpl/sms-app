const knex = require('../database/smsApp')
const { tableSentSmsRecord, tableSentSmsContent } =  require('./smsTable')

const insertSentSmsRecord = (options) => {
    const  { smsContentObj = null, smsRecordObj = [] } = options

    if (!smsContentObj || !smsRecordObj.length) {
        throw new Error('sms content and response list required!')
    }

    return knex.transaction(trx => {
                knex(tableSentSmsContent)
                .transacting(trx)
                .insert(smsContentObj)
                .then(id => {
                    return knex(tableSentSmsRecord)
                            .transacting(trx)
                            .insert(smsRecordObj)
                })
                .then(trx.commit)
                .catch(trx.rollback)
    })
    .then(res => { return res })
    .catch(e => { throw e })
}

module.exports = {
    insertSentSmsRecord
}