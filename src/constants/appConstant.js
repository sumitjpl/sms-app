module.exports = {
    SMS_DELIVERY_STATUS: {
        SENT: "Sent",
        DELIVERED: "Delivered",
        FAILED: "Failed",
        SCHEDULED: "Scheduled"
    },
    
    OPERATOR_STATUS_CODE: {
        200: "Accepted for delivery",
        400: "Mandatory parameters are missing",
        401: "Authorization has been refused",
        403: "Account balance issue or Number exists under NCPR database."
    },
    UPLOAD_FILE_CONFIG : {
        EXCEL: {
            maxExcelFileSize: 5000000, //In bytes
            maxExcelFileSizeInMb: "5MB",
            mimeTypes:["application/vnd.ms-excel"]
        }
    },
    ADD_TEMPLATE_EXCEL_HEADERS: ["Template_Id", "Template_Name", "Template_Body", "Sender_Id"]
}