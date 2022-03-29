const xlsx = require("xlsx")

const parseExcelFileToJson = ({ filePath = null }) => {
    try {
        const file =  xlsx.readFile(filePath)
        const sheetNames = file.SheetNames
        const totalSheets = sheetNames.length
        let parsedData = []
        for (let i = 0; i < totalSheets; i++) {
            const jsonData = xlsx.utils.sheet_to_json(file.Sheets[sheetNames[i]])
            parsedData.push(...jsonData)
        }
        return parsedData
    } catch (err) {
        throw err
    }
}

module.exports = {
    parseExcelFileToJson
}