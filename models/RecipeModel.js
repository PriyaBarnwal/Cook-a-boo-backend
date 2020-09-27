const mongoose = require('mongoose')

const RecipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  title: {
    type: String,
    required: [true, 'Title of recipe is required'],
    unique: [true, "This recipe already exists!"]
  },
  summary: {
    type: String,
    required: [true, 'Summary is required']
  },
  servings: {
    type: Number,
    required: [true, 'no. of servings is required']
  },
  image_url: {
    type: String,
    required: [true, "Recipe must have an image"]
  },
  Cookingtime: {
    type: String,
    required: [true, 'cooking time is required']
  },
  ratingsAverage: {
    type: Number,
    default: 4.0,
    max: [5, "rating should be less than or equal to 5"]
  },
  ratings: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users'
      },
      rating: {
        type: Number
      }
    }
  ],
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  tags: [String],
  ingredients: [
    {
      type: String,
      required: [true, 'please add atleast 1 ingredient']
    }
  ],
  steps: [
    {
      type: String,
      required: [true, 'please add atleast 1 step instruction']
    }
  ],
  likes: [{
      type: mongoose.Schema.ObjectId,
      ref: 'users'
  }],
  date: {
    type: Date,
    default: Date.now()
  },
  dummy: {
    type: Boolean,
    default: false
  }
})

RecipeSchema.pre('save', async function(next) {
  if(this.isModified('ratings')) {
    this.ratingsQuantity = this.ratings.length
    this.ratingsAverage = (this.ratings.reduce((acc, cVal) => acc+cVal.rating, 0))/this.ratings.length
    next()
  } 
  return next()
})

RecipeSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name'
  })
  next()
})

let Recipe = mongoose.model('recipes', RecipeSchema)
module.exports = Recipe