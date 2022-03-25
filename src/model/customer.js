
const knex = require('../database/smsApp')
const { 
    tableClientCustomer, 
    tableCustomerGroupMapping,
    tableGroupMaster
} = require('./smsTable')

const findOrCreateCustomerModel = async (options = {}) => {
    const { mobile_no = '', created_user_id = '' } = options
    if (!mobile_no || !created_user_id ) {
        throw new Error('Mandatory parameter missing!')
    }
    
    return knex.transaction(trx => {
        return trx(tableClientCustomer).where(`mobile_no`, mobile_no).where(`created_user_id`, created_user_id)
        .then(res => {
            if (!res.length) {
                return trx(tableClientCustomer).insert(options)
                        .then(() => {
                            return trx(tableClientCustomer).where(`mobile_no`, mobile_no).where(`created_user_id`, created_user_id)
                        })
                        .then(res => {
                            return [{ [mobile_no]: res[0] }]
                        })
            } else {
                return [{ [mobile_no]: `${mobile_no} is already exists!` }]
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(resp => resp)
    .catch(err =>  { throw err })
}

const addCustomerGroupMappingModel = async options => {
    const { customer_id = '', group_id = '', created_at = '' } = options
    if (!customer_id || !group_id || !created_at) {
        throw new Error('Mandatory parameter missing!')
    }

    return knex.transaction(trx => {
        return trx(tableCustomerGroupMapping).where('customer_id', customer_id).where('group_id', group_id).whereNull('deleted_at')
                .then(result => {
                    if (!result.length) {
                        return trx(tableCustomerGroupMapping).insert(options)
                    }
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(resp => resp)
            .catch(err => { throw err })
}

const getCustomerListModel = async ({
    userId,
    customerId,
    groupId,
    mobileNo,
    customerStatus = [],
    customerGroupMappingStatus = [],
}) => {
    const sql = knex.select(
                knex.raw(`cust.*, cust_grp.group_id, grp.group_name, IF(cust.deleted_at is null, 'Active', 'Deleted') as status`)
                )
                .from(`${tableClientCustomer} as cust`)
                .leftJoin(`${tableCustomerGroupMapping} as cust_grp`, function() {
                    this.on('cust_grp.customer_id', 'cust.id')
                })
                .leftJoin(`${tableGroupMaster} as grp`, function() {
                    this.on('grp.id', 'cust_grp.group_id')
                })
    
    if (customerId) {
        sql.where('cust.id', customerId)
    }

    if (userId) {
        sql.where('cust.created_user_id', userId)
    }

    if (groupId) {
        sql.where('cust_grp.group_id', groupId)
    }

    if (Array.isArray(mobileNo) && mobileNo.length) {
        sql.whereIn('cust.mobileNo', mobileNo)
    } else if (mobileNo) {
        sql.where('cust.mobileNo', mobileNo)
    }

    if (Array.isArray(customerStatus) && customerStatus.length) {
        if (customerStatus.includes(1)) {
            sql.whereNull('cust.deleted_at')
        }
        if (customerStatus.includes(0)) {
            sql.whereNotNull('cust.deleted_at')
        }
    }

    if (Array.isArray(customerGroupMappingStatus) && customerGroupMappingStatus.length) {
        if (customerGroupMappingStatus.includes(1)) {
            sql.whereNull('cust_grp.deleted_at')
        }
        if (customerGroupMappingStatus.includes(0)) {
            sql.whereNotNull('cust_grp.deleted_at')
        }
    }

    return sql
}

module.exports = {
    getCustomerListModel,
    findOrCreateCustomerModel,
    addCustomerGroupMappingModel
}