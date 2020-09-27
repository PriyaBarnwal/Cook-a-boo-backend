import mongoose from 'mongoose'
import config from 'config'

const db = config.get('MONGODB_URI')

let connectDB = async()=> {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

    console.log('db connection successful!')
  }
  catch(err) {
    console.log(err.message)
    process.exit(1)
  }
}

module.exports = connectDB