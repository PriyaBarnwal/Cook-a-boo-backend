const Recipe = require('../models/RecipeModel')
const User = require('../models/UserModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')

exports.getAllRecipes = catchAsync(async(req, res, next)=> {
  let recipes

  if(req.query) 
    recipes = await Recipe.find({ $or: [{ tags: {$in: req.query.q}}, { title: new RegExp(req.query.q, 'i') }]}).sort({date: -1})
  else
    recipes = await Recipe.find().sort({date: -1})
  
  res.status(200).json({
    status: 'success',
    number: recipes.length,
    data: recipes
  })
})

exports.createRecipe = catchAsync(async(req, res, next)=> {
  let {title, summary, servings, image_url, Cookingtime, tags, ingredients, steps} = req.body

  let recipe = new Recipe({
    user: req.user._id,
    title, summary, servings, image_url, Cookingtime, tags, ingredients, steps
  })

  await recipe.save()

  let recipeCreator = await User.findById(req.user._id)

  recipeCreator.recipes.unshift(recipe._id)

  await recipeCreator.save()

  res.status(200).json({
    status: 'success',
    data: recipe
  })
})

exports.TopTenGenerator = catchAsync(async(req, res, next)=> {
  let topTenRecipes = await Recipe.find().sort('-ratingsAverage').limit(10)

  res.status(200).json({
    status: 'success',
    data: topTenRecipes
  })
})

exports.popularGenerator = catchAsync(async(req, res, next)=> {
  let popularRecipes = await Recipe.find({date:{$gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)}}).sort('-ratingsAverage').limit(10)

  res.status(200).json({
    status: 'success',
    data: popularRecipes
  })
})

exports.getRecipe = catchAsync(async(req, res, next)=> {
  let recipe = await Recipe.findById(req.params.recipeid)

  if(!recipe) return next(new AppError('Recipe not found', 404))

  res.status(200).json({
    status: 'success',
    data: recipe
  })
})

exports.updateRecipeRatings = catchAsync(async(req, res, next)=> {
  let recipe = await Recipe.findById(req.params.recipeid)
  
  if(!recipe) return next(new AppError('Recipe not found', 404))
    
  let index = recipe.ratings.map(rating =>rating.user.toString()).indexOf(req.user._id) 

  if(index=== -1) {
    recipe.ratings.unshift({user: req.user._id, rating: req.body.rating})
  }
  else {
    recipe.ratings.splice(index, 1, {user: req.user._id, rating: req.body.rating})
  }

  await recipe.save()

  res.status(200).json({
    status: 'success',
    data: recipe
  })
})

exports.deleteRecipe = catchAsync(async(req, res, next)=> {
  let recipe = await Recipe.findById(req.params.recipeid)
  
  if(!recipe) return next(new AppError('Recipe not found', 404))

  if(recipe.user._id.toString() != req.user._id) return next(new AppError('You are not authorized to perform this action', 401))

  let recipeCreator = await User.findById(req.user._id)

  recipeCreator.recipes = recipeCreator.recipes.filter(item => (item.toString() != recipe._id))

  await recipeCreator.save()
  recipe.remove()

  res.status(200).json({
    status: 'success',
    message: 'recipe deleted successfully'
  })
  
})

exports.toggleLike = catchAsync(async(req, res, next)=> {
  let recipe = await Recipe.findById(req.params.recipeid)
  
  if(!recipe) return next(new AppError('Recipe not found', 404))
    
  let index = recipe.likes.map(like =>like.toString()).indexOf(req.user._id) 

  if(index=== -1) {
    recipe.likes.unshift(req.user._id)
    await User.findByIdAndUpdate(req.user._id, { $push: { favorites: recipe._id}})
  }
  else {
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: recipe._id}})
    recipe.likes.splice(index,1)
  }

  await recipe.save()

  res.status(200).json({
    status: 'success',
    data: recipe
  })
})