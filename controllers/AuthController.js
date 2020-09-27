const config = require('config')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/emailUtils')

exports.signUp = catchAsync(async(req, res, next)=> {
  let {name, email, password, photoUrl} = req.body

  let newUser = new User({
    name: name,
    email: email,
    password: password,
    photo: photoUrl
  })

  await newUser.save()

  let token = jwt.sign({id: newUser._id}, config.get('JWT_SECRET'), {expiresIn: config.get('JWT_EXPIRY')})
  res.status(200).json({
    status: 'success',
    data: {
      token,
      user: newUser
    }
  })
})

exports.login = catchAsync(async(req, res, next)=> {
  let {email, password} = req.body

  if(!email || !password) return next(new AppError('Please provide credentials to login', 400))

  let user = await User.findOne({email}).select('+password')

  if(!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError('Email and password do not match', 401))

  let token = jwt.sign({id: user._id}, config.get('JWT_SECRET'), {expiresIn: config.get('JWT_EXPIRY')})
  res.status(200).json({
    status: 'success',
    data: {
      token,
      user
    }
  })
})

exports.checkAuth = catchAsync(async(req, res, next) => {
  let token
  //check if authentication token exists
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1]
  else
    return next(new AppError('Please login to access this page!', 401))

  //verify the token
  let decoded = jwt.verify(token, config.get('JWT_SECRET'))

  //check if user has not been deleted
  let existingUser = await User.findById(decoded.id)
  if(!existingUser) return next(new AppError('The user belonging to this token no longer exists', 401))
  //check if user has not changed the password

  //if above all is false then access is granted
  req.user = existingUser
  next()
})

exports.forgotPassword = catchAsync(async(req, res, next) => {
  //find user
  let user = await User.findOne({email: req.body.email})
  if(!user) return next(new AppError('This email has not been registered', 404))

  //generate a password reset token
  let resetToken = await user.createPasswordResetToken()
  await user.save()

  //send the reset mail
  try {
    await  sendEmail({
      email: req.body.email,
      subject: 'Password rest token(validity 15 mins)',
      message: `Click this link ${req.protocol}://${req.headers.host}/api/users/resetPassword/${resetToken} to reset password. This link will expire in 15 minutes. If you do not want to change your password then please ignore.`
    })

    res.status(200).json({
      status:'success',
      message: 'reset link has been sent to your registered email id'
    })
  }
  catch(err) {
    console.log(err)
    user.passwordResetToken = undefined
    user.passwordResetExpiry = undefined
    await user.save()
    return next(new AppError('Failed to send the token, please try again.', 500))
  }
})

exports.resetPassword = catchAsync(async(req, res, next) => {
  //check if token is valid(fetch user based on token and whther it has expired)
  let token = req.params.token,
    passwordToken = crypto.createHash('sha256').update(token).digest('hex')

    console.log(passwordToken)
  let user = await User.findOne({
    passwordResetToken: passwordToken,
    passwordResetExpiry: {$gte: Date.now()}
  })

  if(!user) return next(new AppError('invalid token or rest link has expired!', 400))

  //update the password
  user.password = req.body.newPassword
  user.passwordResetToken = undefined
  user.passwordResetExpiry = undefined

  await user.save()

  //jwt generation 
  let authToken = jwt.sign({id: user._id}, config.get('JWT_SECRET'), {expiresIn: config.get('JWT_EXPIRY')})
  res.status(200).json({
    status: 'success',
    data: {
      token: authToken,
      user
    }
  })
})

exports.changePassword = catchAsync(async(req, res, next) => {
  let user = await User.findById(req.user._id).select('+password')
  console.log(user.password)
  console.log(req.body.oldPassword)
  if(!user || !(await bcrypt.compare(req.body.oldPassword, user.password))) 
    return next(new AppError('Incorrect password. Please try again!', 401))

  user.password = req.body.newPassword
  await user.save()

  let token = jwt.sign({id: user._id}, config.get('JWT_SECRET'), {expiresIn: config.get('JWT_EXPIRY')})
  res.status(200).json({
    status: 'success',
    data: {
      token,
      user
    }
  })
})