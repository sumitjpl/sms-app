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

module.exports = {
    getSmsTemplateModel
}
