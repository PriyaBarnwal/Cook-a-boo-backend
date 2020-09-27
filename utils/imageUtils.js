const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const config = require('config')

aws.config.update({
  secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
  accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
  region: 'ap-south-1'
})

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
  //console.log(file)
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type, only JPEG, JPG and PNG is allowed!'), false)
  }
}

upload = multer({
  fileFilter,
  limits: {
    fileSize: 1024*1024
  } ,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'cook-a-boo',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname})
    },
    key: function (req, file, cb) {
      console.log(file)
      cb(null, Date.now().toString()+'_'+file.originalname)
    }
  })
})

module.exports = upload