
const moment = require("moment")
const fs = require("fs")

const appConfig = require('../../config/application.json')
const { ADD_TEMPLATE_EXCEL_HEADERS } = require('../../constants/appConstant')

const { addSmsTemplateModel, getSmsTemplateModel, addSmsTemplateBulkModel } = require('../../model/smsTemplate')
const { parseExcelFileToJson } = require("../../helpers/parseFile")
const { extractValue } = require("../../utils/commonFunction")

const addSmsTemplateService = async (options) => {
    try {
        const { created_user_id } = options

        if (!created_user_id) {
            throw new Error('Logged in user not found!')
        }

        const dbResult = await addSmsTemplateModel({
            ...setSmsTemplateObj(options)
        })
        return dbResult
    } catch (err) {
        throw err
    }
}

const setSmsTemplateObj = (options) => {
    return {
        ...options,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        status: appConfig.SMS_TEMPLATE_STATUS.APPROVED_BY_OPERATOR
    }
}

const getSmsTemplateService = async (options) => {
    try {
        const dbResult = await getSmsTemplateModel(options)
        return dbResult
    } catch (err) {
        throw err
    }
}

const addSmsTemplateBulkService = async ({
    filePath = null,
    loggedInUserId = null
}) => {
    try {
        if (!filePath) {
            throw new Error('File path not defined!')
        }

        const jsonData =  parseExcelFileToJson({ filePath }) || []
        if (process.env.NODE_ENV === 'local') {
            fs.unlinkSync(filePath)
        }

        if (!jsonData.length) {
            throw new Error('Data not found in the excel file!')
        }

        const jsonHeaders = Object.keys(jsonData[0])
        let difference = jsonHeaders.filter(x => !ADD_TEMPLATE_EXCEL_HEADERS.includes(x))
        if (difference.length) {
            throw new Error(`Unknown column name(s) found - ${difference.join(",")}`)
        }

        const Template_Ids = extractValue(jsonData, 'Template_Id')
        const existingTemplates = await getSmsTemplateService({
                                        operatorTemplateId: Template_Ids
                                })
        let existingTemplatesLength = existingTemplates.length
        if (existingTemplatesLength) {
            let existingTemplateIds = extractValue(existingTemplates, "operator_template_id").join(",")
            let errMessage = existingTemplatesLength === 1 ? `${existingTemplateIds} - SMS template with the Template_Id already exists in the system` : `${existingTemplateIds} - SMS template with these Template_Ids already exists in the system`
            throw new Error(errMessage)
        }

        let insertObjList = []
        jsonData.map(({ 
            Template_Id,
            Template_Name,
            Template_Body,
            Sender_Id
        }) => {
            insertObjList.push({
                ...setSmsTemplateObj({
                    created_user_id: loggedInUserId,
                    operator_template_id: Template_Id,
                    template_name: Template_Name,
                    template_body: Template_Body,
                    sender_id: Sender_Id
                })
            })
        })
        
        const dbResult = await addSmsTemplateBulkModel(insertObjList)
        
        return dbResult
    } catch (err) {
        throw err
    }
}

module.exports = {
    addSmsTemplateService,
    setSmsTemplateObj,
    getSmsTemplateService,
    addSmsTemplateBulkService
}