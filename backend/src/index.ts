import { MongoMemoryServer } from 'mongodb-memory-server'
import 'dotenv/config'
import 'module-alias/register'
import validateEnv from '@/utils/validateEnv'
import App from './app'
import { controllers, httpMiddleware } from './setup'

validateEnv()

const { MONGO_PATH, PORT } = process.env

const app = new App(controllers, Number(PORT), httpMiddleware, MONGO_PATH)

app.listen()

const mong = async () => {
  const mongoServer = await MongoMemoryServer.create()
  console.log(mongoServer.getUri())
}

mong()
