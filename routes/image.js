import express from 'express'
import upload from '../utils/imageUtils'
import * as AuthController from '../controllers/AuthController'

const Router = express.Router()
const singleUpload = upload.single('image')

Router.route('/upload')
  .post( 
    AuthController.checkAuth, 
    (req, res, next) => {
      singleUpload(req, res, function(err) {
        if (err) {
          console.log(err)
          return res.status(422).json({
            status: 'failed',
            message: err.message
          })
        }
        if(!req.file) 
          return res.status(400).json({
            status: 'error',
            message: 'please add an image to upload'
          })

        return res.status(200).json({
          status: 'success', 
          imageUrl: req.file.location
        })
    })
  })

module.exports = Router