const json2xls = require("json2xls")

const { ADD_TEMPLATE_EXCEL_HEADERS } = require('../../constants/appConstant')
const { successResponse, errorResponse } = require("../../utils/apiResponse")
const { 
    addSmsTemplateService, 
    getSmsTemplateService, 
    addSmsTemplateBulkService 
} = require("./service")

const addSmsTemplate = async (req, res) => {
    try {
        const { authData: { loggedInUserId } } = req
        let { body } = req
        body.created_user_id = loggedInUserId

        await addSmsTemplateService(body)
        const templateList = await getSmsTemplateService({ createdUserId: loggedInUserId })
        return successResponse({
            message: `Sms template added successfully!`,
            templateList
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const getSmsTemplate = async (req, res) => {
    try {
        const { authData: { loggedInUserId } } = req
        let { body } = req
        body.createdUserId = loggedInUserId
        const templateList = await getSmsTemplateService(body)
        return successResponse({
            templateList
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const getTemplateSampleFile = (req, res) => {
    try {
        let headerObj = {}
        const excelFileHeader = ADD_TEMPLATE_EXCEL_HEADERS || []
        for (const iterator of excelFileHeader) {
            headerObj = {...headerObj, [iterator]: ""}
        }
        let downloadFileName = `add-template-sample.xls`
        res.setHeader(`Content-Type`, `application/octet-stream`)
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${downloadFileName};`
        )
        res.end(json2xls([headerObj], {
            fields:{ 
                Template_Id: "string", 
                Template_Name: "string", 
                Template_Body: "string", 
                Sender_Id: "string" 
            }
        }), 'binary')
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

const addSmsTemplateBulk = async (req, res) => {
    try {
        const { authData: { loggedInUserId } } = req
        if (req.file !== undefined) {
            const {  path: filePath } = req.file
            const result =  await addSmsTemplateBulkService({
                                filePath,
                                loggedInUserId
                            })
            const templateList = await getSmsTemplateService({
                createdUserId: loggedInUserId
            })
            return successResponse({
                message: `Record(s) added successfully!`,
                templateList
            }, res)
        }
        return errorResponse({
            message: `There is some error in the file.`
        }, res)
    } catch (err) {
        return errorResponse({
            statusCode: 500,
            message: err.message
        }, res)
    }
}

module.exports = {
    addSmsTemplate,
    getSmsTemplate,
    getTemplateSampleFile,
    addSmsTemplateBulk
}