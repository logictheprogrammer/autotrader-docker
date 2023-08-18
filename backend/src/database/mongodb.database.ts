import mongoose from 'mongoose'

const mongodbDatabase = (mongoUri: string) => {
  mongoose
    .connect(`${mongoUri}`)
    .then(() => {
      console.log('DB CONNECTED')
    })
    .catch((error) => {
      throw error
    })
}

export default mongodbDatabase
