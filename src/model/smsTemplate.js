const knex = require('../database/smsApp')
const { tableSmsTemplate } = require('./smsTable')

const getSmsTemplateModel = async({
    operatorTemplateId,
    createdUserId
}) => {
    const sql = knex(tableSmsTemplate).select()
    if (operatorTemplateId !== undefined) {
        if (Array.isArray(operatorTemplateId)) {
            sql.whereIn('operator_template_id', operatorTemplateId)
        } else {
            sql.where('operator_template_id', operatorTemplateId)
        }
    }

    if (createdUserId) {
        sql.where('created_user_id', createdUserId)
    }

    return sql
}

const addSmsTemplateModel = async (insertObj) => {
    const { operator_template_id } = insertObj
    return knex.transaction(trx => {
        return trx(tableSmsTemplate).where(`operator_template_id`, operator_template_id)
                .then(result => {
                    if (result.length) {
                        throw new Error(`Record already exists with the operator template id - ${operator_template_id}`)
                    }
                    return trx(tableSmsTemplate).insert(insertObj)
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(resp => resp)
            .catch(err => { throw err })
}

const addSmsTemplateBulkModel = async (insertObjList = []) => {
    if (!insertObjList.length) {
        throw new Error(`Empty sms template insert list!`)
    }
    const sql = knex(tableSmsTemplate).insert(insertObjList)
    return sql
}

module.exports = {
    getSmsTemplateModel,
    addSmsTemplateModel,
    addSmsTemplateBulkModel
}
