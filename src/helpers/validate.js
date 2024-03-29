const Validator = require('validatorjs')

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
const indianMobileRegex = /^[6-9][0-9]{9,12}$/
const nameRegex = /^[a-zA-Z ]{2,100}$/ 
const groupNameRegex = /^[a-zA-Z-_0-9 ]{1,240}$/ 

Validator.register('strict', value => passwordRegex.test(value),
    'password must contain at least one uppercase letter, one lowercase letter and one number')
Validator.register('indian_mobile', value => indianMobileRegex.test(value),
    'Invalid mobile number')
Validator.register('name', value => nameRegex.test(value),
    'Invalid name')
Validator.register('group_name', value => groupNameRegex.test(value),
'Invalid group name')

const validator = (body, rules, customMessage, callback) => {
    const validation = new Validator(body, rules, customMessage)

    validation.passes(() => callback(null, true))
    validation.fails(() => callback(validation.errors, false))
}


module.exports =  { validator }