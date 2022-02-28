const knex = require('../database/smsApp')
const { tableGroupMaster } = require('./smsTable')

const getGroupMasterModel = async ({
    groupId,
    userId,
    groupName,
    status = []
}) => {
    const sql = knex(tableGroupMaster)
                .select('*')
    
    if (groupId) {
        sql.where('id', groupId)
    }

    if (userId) {
        sql.where('user_id', userId)
    }

    if (groupName) {
        sql.whereRaw(`group_name LIKE '%${groupName}%'`)
    }

    if (status.length) {
        if (status === 1) {
            sql.whereNull(`deleted_at`)
        }
        if (status === 0) {
            sql.whereNotNull(`deleted_at`)
        }
    }

    sql.orderBy('id', 'desc')

    return sql
}

const addGroupModel = async options => {
    const { user_id, group_name } = options
    if (!user_id) {
        throw new Error('user id required!')
    }

    if (!group_name) {
        throw new Error('group name required!')
    }

    return knex.transaction(trx => {
        return trx(tableGroupMaster).where('user_id', user_id).where('group_name', group_name)
                .then(result => {
                    if (result.length) {
                        throw new Error('Group name already exists!')
                    }
                    return trx(tableGroupMaster).insert(options)
                            .then(() => trx(tableGroupMaster).where('user_id', user_id))
                })
                .then(trx.commit)
                .catch(trx.rollback)
    })
    .then(resp => resp)
    .catch(err => { throw err })
}

const updateGroupModel = async options => {
    const { id, user_id } = options

    if (!id) {
        throw new Error('id required!')
    }
    return knex.transaction(trx => {
        return trx(tableGroupMaster).where('id', id).where('user_id', user_id).update(options)
                .then(isUpdated => {
                    if (!isUpdated) {
                        throw new Error(`Record could't get updated! please try again.`)
                    }
                    return trx(tableGroupMaster).where('user_id', user_id).whereNull(`deleted_at`)
                })
                .then(trx.commit)
                .catch(trx.rollback)
    })
    .then(resp => resp)
    .catch(err => { throw err })
}

module.exports = {
    getGroupMasterModel,
    addGroupModel,
    updateGroupModel
}