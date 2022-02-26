const knex = require('../database/smsApp')

module.exports = class KNEX_TRANSACTION {
    async start() {
        return await knex.transaction()
    }

    commit() {
        this.txn.commit()
    }

    rollback() {
        this.txn.rollback()
    }
}