// import { MongoMemoryServer } from 'mongodb-memory-server'
import 'dotenv/config'
import 'module-alias/register'
import validateEnv from '@/helpers/validateEnv'
import App from './app'
import { controllers } from './setup'

validateEnv()

const { MONGO_PATH, PORT } = process.env

const app = new App(controllers, Number(PORT), false, {
  mogodbUri: MONGO_PATH,
})

// MongoMemoryServer.create().then((sever) => {
//   console.log(sever.getUri())
// })

app.listen()
