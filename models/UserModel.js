const mongoose = require('mongoose')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user should have a name"]
  },
  email: {
    type: String,
    required: [true, "user should have email"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "please enter the password"],
    minLength: 8,
    select: false
  },
  photo: {
    type: String
  },
  youtube: {
    type: String
  },
  location: {
    type: String
  },
  recipes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'recipes'
    }
  ],
  recipeCount: {
    type: Number,
    default: 0
  },
  favorites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'recipes'
    }
  ],
  bio: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  },
  passwordResetToken: String,
  passwordResetExpiry: Date
})

UserSchema.pre('save', async function(next) {
  if(this.isModified('password') || this.isNew) {
    let salt= await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    next()
  } else if(this.isModified('recipes')) {
    this.recipeCount = this.recipes.length
    next()
  } 
  return next()
})

UserSchema.methods.createPasswordResetToken = async function() {
  let resetToken = await crypto.randomBytes(20).toString('hex')

  //save the encrypted one in db and send the normal one to the mail
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpiry = Date.now() + (15*60*1000)

  return resetToken
}

let User = mongoose.model('users', UserSchema)
module.exports = User