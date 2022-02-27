
const knex = require('../database/smsApp')
const { tableClientCustomer } = require('./smsTable')

const findOrCreateCustomerModel = async (options = {}) => {
    const { mobile_no = '', created_user_id = '' } = options
    if (!mobile_no || !created_user_id ) {
        return false
    }
    
    return knex.transaction(trx => {
        return trx(tableClientCustomer).where(`mobile_no`, mobile_no).where(`created_user_id`, created_user_id)
        .then(res => {
            if (!res.length) {
                return trx(tableClientCustomer).insert(options)
                        .then(() => {
                            return trx(tableClientCustomer).where(`mobile_no`, mobile_no).where(`created_user_id`, created_user_id)
                        })
            } else {
                return res
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(resp => resp)
    .catch(err =>  { throw err })
}

module.exports = {
    findOrCreateCustomerModel
}