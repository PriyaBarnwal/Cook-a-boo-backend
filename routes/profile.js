import express from 'express'
import * as AuthController from '../controllers/AuthController'
import * as ProfileController from '../controllers/ProfileController'

const Router = express.Router()

Router.route('/')
  .get(ProfileController.getAllProfiles)

Router.route('/:userid')
  .get(ProfileController.getProfile)
  .patch(AuthController.checkAuth, ProfileController.updateProfile)

module.exports = Router
