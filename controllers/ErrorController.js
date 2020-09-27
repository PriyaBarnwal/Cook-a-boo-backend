import AppError from '../utils/AppError'

let handleCastError = (error) => {
  return new AppError(`invalid value ${error.value}. No page found.`,404)
}

let handleDuplicateId = (error) => {
  return new AppError(`Already exists. Duplicate Error.`,400)
}

let handleValidationError = (error) => {
  let msg = Object.values(error.errors).map(item =>item.properties.message).join('. ')

  return new AppError(msg,400)
}

let handleInvalidJWtoken = (error) => {
  return new AppError(`Invalid signature. Please login again.`,401)
}

let handleTokenExpiration = (error) => {
  return new AppError(`Token has expired. Please login again.`,401)
}


module.exports = (err, req, res, next) => {
  let error = {...err, message: err.message}

  //invalid tour id
  if(err.name === 'CastError') error = handleCastError(err)

  //duplicate unique values during creation
  if(err.code === 11000) error = handleDuplicateId(err)

  //validation errors
  if(err.name === 'ValidationError') error = handleValidationError(err)

  //jwt errors
  console.log(err.name)
  if(err.name === 'JsonWebTokenError') error = handleInvalidJWtoken(err)

  if(err.name === 'TokenExpiredError') error = handleTokenExpiration(err)

  let statusCode = error.statusCode || 500,
  status = error.status || 'error'
  
  res.status(statusCode).json({
    status,
    message: error.message
  })
}