const knex = require('knex')
require('dotenv-safe').config()
const dbConObj = require('../../knexfile')

module.exports = knex(dbConObj)