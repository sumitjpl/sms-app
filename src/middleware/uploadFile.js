const multer = require("multer")
const path = require("path")
const fs = require("fs")
const moment = require("moment")

const { errorResponse } = require('../utils/apiResponse')
const { UPLOAD_FILE_CONFIG } =  require('../constants/appConstant')

const tempUploadPath = path.join(path.resolve("./"), '/resources/uploads/')
if (!fs.existsSync(tempUploadPath)) {
    fs.mkdirSync(tempUploadPath, { recursive: true })
}

const excelFilter = (req, file, cb) => {
    const { mimetype } = file
    if (!UPLOAD_FILE_CONFIG.EXCEL.mimeTypes.includes(mimetype)) {
        cb(new Error("Please upload only excel file."), false)
    } else {
        cb(null, true)
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, `${moment().format("YYYYMMDDHHmmss")}_${req.authData.loggedInUserId}_${file.originalname}`)
    }
})
const upload = multer({ 
    storage: storage, 
    fileFilter: excelFilter,
    onError: function(err, next) {
        next(err)
    }
}).single('addTemplateExcelFile')

const uploadExcelFile = (req, res, next) => {
    upload(req, res, function(err) {
        if (req.file !== undefined) {
            const { path: filePath = null, size = 0 } = req.file
            if (size > UPLOAD_FILE_CONFIG.EXCEL.maxExcelFileSize) {
                if (filePath) {
                    fs.unlinkSync(filePath)
                }
                
                return errorResponse({
                    statusCode: 500,
                    message: `Exceeds file size limit. Max allowed file size is - ${UPLOAD_FILE_CONFIG.EXCEL.maxExcelFileSizeInMb}`
                }, res)
            }
        }
        if (err instanceof multer.MulterError) {
            return errorResponse({ message: err.message }, res)
         } else if (err) {
             return errorResponse({ message: err.message }, res)
         }
         next()
    })
}

module.exports = {
    uploadExcelFile
}