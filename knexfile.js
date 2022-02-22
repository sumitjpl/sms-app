require('dotenv-safe').config()

module.exports = {
    client: 'mysql',
    connection: {
        host: process.env.DB_SMS_HOST_NAME,
        user: process.env.DB_SMS_USERNAME,
        password: process.env.DB_SMS_PASSWORD,
        database: process.env.DB_SMS_DATABASE
    },
    pool: { min: 0, max: 100 }
}