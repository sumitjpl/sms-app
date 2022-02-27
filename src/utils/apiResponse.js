const successResponse = (data, res) => {
  return res.status(200).json({
    ...data,
    success: true
  })
}

const errorResponse = (data, res) => {
  const { statusCode = 500 } = data
  return res.status(statusCode).json({
    ...data,
    success: false
  })
}
module.exports = { successResponse, errorResponse }
