const express = require('express')
const { verifyToken } = require('../../middleware/authApi')
const { 
    getUserDetails, 
    groupList,
    addGroup,
    modifyGroup,
    updateUser
} = require('../../controllers/user')

module.exports = () => {
    const api = express.Router()
    
    api.get('/getUser', verifyToken, getUserDetails)
    api.get('/groupList', verifyToken, groupList)
    api.post('/addGroup', verifyToken, addGroup)
    api.put('/modifyGroup', verifyToken, modifyGroup)
    api.put('/updateUser', verifyToken, updateUser)

    return api
}