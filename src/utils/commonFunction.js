const bcrypt = require('bcrypt')

const generatePassword = async(options = {}) => {
    const { saltLen = 10 } = options
    const salt = await bcrypt.genSalt(saltLen)
    const hashPassword = await bcrypt.hash(user.password, salt)
    return hashPassword
}

module.exports = {
    generatePassword
}