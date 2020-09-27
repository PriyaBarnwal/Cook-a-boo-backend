import express from 'express'
import * as AuthController from '../controllers/AuthController'
import {body} from 'express-validator'


const Router = express.Router()

Router.route('/signup')
  .post([
    body('name', 'name is required').not().isEmpty(),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'password length should be greater or equal to 8').isLength({min:8})
  ],AuthController.signUp)

Router.route('/login')
  .post( AuthController.login)

Router.route('/forgotPassword')
  .post(AuthController.forgotPassword)

Router.route('/resetPassword/:token')
  .patch(AuthController.resetPassword)

//for all routes below this
Router.use(AuthController.checkAuth)

Router.route('/changePassword')
  .patch(AuthController.changePassword)


module.exports = Router
