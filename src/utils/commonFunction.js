const bcrypt = require('bcrypt')

const generatePassword = async(options = {}) => {
    const { saltLen = 10 } = options
    const salt = await bcrypt.genSalt(saltLen)
    const hashPassword = await bcrypt.hash(user.password, salt)
    return hashPassword
}

const isValidMobileNo = (mobileNo) => {
    response = { isValid: true, message: '' }
    mobileNo = String(mobileNo)
    mobileNoLength = mobileNo.length

    if (mobileNoLength < 10 || mobileNoLength > 12) {
        response.isValid = false
        response.message = `Mobile number should be 10 or 12 digit long`

        return response
    }
    const startWithNumbers = ['9','8','7','6']
    if (mobileNoLength === 12) {
        firstTwoDigits = `${mobileNo[0]}${mobileNo[1]}`
        thirdDigit = `${mobileNo[2]}`
        if (firstTwoDigits !== '91') {
            response.isValid = false
            response.message = `If mobile number is 12 digit then it should start with 91`

            return response
        }
        
        if (!startWithNumbers.includes(thirdDigit)) {
            response.isValid = false
            response.message = `If mobile number is 12 digit then its third digit should start with 9,8,7,6`

            return response
        }
    } else if (mobileNoLength === 12) {
        firstDigit = `${mobileNo[0]}`
        if (!startWithNumbers.includes(firstDigit)) {
            response.isValid = false
            response.message = `If mobile number is 10 digit then its first digit should start with 9,8,7,6`

            return response
        }
    }

    return response
}

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

module.exports = {
    generatePassword,
    isValidMobileNo,
    generateOtp
}