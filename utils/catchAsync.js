const {validationResult} = require('express-validator')

let catchAsync =(func) => {
  return (req, res, next) => {
    let errors = validationResult(req).errors
    if (errors && errors.length > 0)
      return res.status(400).json({
        status: 'failed',
        message: errors.map(error=>error.msg).join(',')
      })
    func(req, res, next).catch(err=> next(err))
  }
}

module.exports = catchAsync