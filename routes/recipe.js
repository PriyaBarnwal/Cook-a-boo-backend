import express from 'express'
import {body} from 'express-validator'

import * as RecipeController from '../controllers/RecipeController'
import * as AuthController from '../controllers/AuthController'

const Router = express.Router()

Router.route('/top-ten-recipes')
  .get(RecipeController.TopTenGenerator)

Router.route('/popular-recipes-of-the-week')
  .get(RecipeController.popularGenerator)

Router.route('/')
  .get(RecipeController.getAllRecipes)
  .post(AuthController.checkAuth,[
    body('title', 'Title of recipe is required').not().isEmpty(),
    body('summary', 'A short description of recipe is required').not().isEmpty(),
    body('servings').isNumeric().withMessage('servings must be a number'),
    body('image_url', 'An image of dish is required').not().isEmpty(),
    body('Cookingtime', 'Cooking time is required').not().isEmpty(),
    body('ingredients').custom(value => {
        if(!value || value.length === 0)
          throw new Error('Please enter atleast one ingredient')
        return true
    }),
    body('steps').custom(steps => {
        if(!steps || steps.length === 0)
          throw new Error('Please enter atleast one step')
        return true
    })
  ], RecipeController.createRecipe)

Router.route('/:recipeid')
  .get(RecipeController.getRecipe)
  .patch(
    AuthController.checkAuth,
    [body('rating', 'please give a rating between 0 and 5').not().isEmpty().isFloat({ min: 0, max: 5 })],
    RecipeController.updateRecipeRatings
  )
  .delete(
    AuthController.checkAuth,
    RecipeController.deleteRecipe
  )

Router.route('/:recipeid/like')
  .put(
    AuthController.checkAuth,
    RecipeController.toggleLike
  )

module.exports = Router