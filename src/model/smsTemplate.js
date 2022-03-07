const knex = require('../database/smsApp')
const { tableSmsTemplate } = require('./smsTable')

const getSmsTemplateModel = async({
    operatorTemplateId,
    createdUserId
}) => {
    const sql = knex(tableSmsTemplate).select()

    if (operatorTemplateId) {
        sql.where('operator_template_id', operatorTemplateId)
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
                            .then(() => {
                                return getSmsTemplateModel({})
                            })
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(resp => resp)
            .catch(err => { throw err })
}

module.exports = {
    getSmsTemplateModel,
    addSmsTemplateModel
}
