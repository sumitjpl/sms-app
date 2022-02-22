const successResponse = (data, res) =>
  res.status(200).json({
    ...data,
    success: true
  })
const errorResponse = (data, res) => {
  const statusCode = data.statusCode || 500
  return res.status(statusCode).json({
    ...data,
    success: false
  })
}
module.exports = { successResponse, errorResponse }
