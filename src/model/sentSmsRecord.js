const knex = require('../database/smsApp')
const { 
    tableSentSmsRecord, 
    tableSentSmsContent, 
    tableSentSmsTracking 
} =  require('./smsTable')

const insertSentSmsRecordModel = ({
    smsContentObj = null,
    smsRecordObj = []
}) => {
    if (!smsContentObj || !smsRecordObj.length) {
        throw new Error('sms content and sent sms list required!')
    }

    return knex.transaction(trx => {
                knex(tableSentSmsContent)
                .transacting(trx)
                .insert(smsContentObj)
                .then(() => {
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

const getSentSmsRecordModel = ({
    uniqueId
}) => {
    const sql = knex(tableSentSmsRecord)
                .select()
                
    if (uniqueId !== undefined) {
        if (Array.isArray(uniqueId)) {
            sql.whereIn('unique_id', uniqueId)
        } else {
            sql.where('unique_id', uniqueId)
        }
    }

    return sql
}

const updateSentSmsRecordModel = ({
    updateObj,
    trackingObj
}) => {
    if (!updateObj || !trackingObj) {
        throw new Error('Update and log object are required!')
    }

    return knex.transaction(trx => {
        return trx(tableSentSmsRecord).where('unique_id', updateObj.unique_id)
                .then(result => {
                    if (result.length) {
                        return trx(tableSentSmsRecord).where('unique_id', updateObj.unique_id).update(updateObj)
                                .then(() => {
                                    return trx(tableSentSmsTracking).insert({ ...trackingObj, prev_status: result[0].status })
                                })
                    }
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(res => { return res })
            .catch(e => { throw e })
}

module.exports = {
    insertSentSmsRecordModel,
    getSentSmsRecordModel,
    updateSentSmsRecordModel
}