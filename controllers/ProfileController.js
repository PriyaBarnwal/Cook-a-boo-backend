
import User from '../models/UserModel'
import AppError from '../utils/AppError'
import catchAsync from '../utils/catchAsync'

export const getAllProfiles = catchAsync(async(req, res, next)=> {
  let profiles

  if(req.query) 
    profiles = await User.find({ name: new RegExp(req.query.q, 'i') }).sort({recipeCount: -1})
  else
    profiles = await User.find().sort({recipeCount: -1})
  
  res.status(200).json({
    status: 'success',
    number: profiles.length,
    data: profiles
  })
})

export const getProfile = catchAsync(async(req, res, next)=> {
  let user = await User.findById(req.params.userid)

  if(!user) return next(new AppError('Chef not found', 404))

  res.status(200).json({
    status: 'success',
    data: user
  })
})

export const updateProfile = catchAsync(async(req, res, next)=> {
  let {name, youtube, location, bio} = req.body

  if(req.params.userid != req.user._id.toString()) 
    return next(new AppError('You are not authorized to perform this action', 401))

  let user = await User.findByIdAndUpdate(req.user._id, {name, youtube, location, bio}, {new: true})

  res.status(200).json({
    status: 'success',
    data: user
  })
})