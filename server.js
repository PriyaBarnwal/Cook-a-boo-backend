import express from 'express'
import path from 'path'
import connectDB from './config/db'

import AppError from './utils/AppError'
import ErrorHandler from './controllers/ErrorController'
import authRoute from './routes/auth'
import profileRoute from './routes/profile'
import recipeRoute from './routes/recipe'
import ImageRoute from './routes/image'

const app = express()

connectDB()

app.use(express.json())

app.use('/api/users', authRoute)
app.use('/api/profiles', profileRoute)
app.use('/api/recipes', recipeRoute)
app.use('/api/images', ImageRoute)

//all routes that dont match the above
app.all('*', (req, res, next)=> {
  let err = new AppError(`no page of ${req.originalUrl} found in this server`, 404)

  next(err)
})

//if u pass an argument to next() it is understood its for error
//if a middleware has 4 arguments it is understood it is an error handling middleware
app.use(ErrorHandler)

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'))

  app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}
const port = process.env.PORT || 3000

// Launch the server on port 3000
const server = app.listen(port, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://${address}:${port}`);
});