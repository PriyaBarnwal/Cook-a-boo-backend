const express = require('express')
const AuthController = require('../controllers/AuthController')
const ProfileController = require('../controllers/ProfileController')

const Router = express.Router()

Router.route('/')
  .get(ProfileController.getAllProfiles)

Router.route('/:userid')
  .get(ProfileController.getProfile)
  .patch(AuthController.checkAuth, ProfileController.updateProfile)

module.exports = Router
