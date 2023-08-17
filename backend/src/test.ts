import 'dotenv/config'
import 'module-alias/register'
import validateEnv from './utils/validateEnv'
import { controllers, httpMiddleware } from './setup'
import App from './app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'

validateEnv()

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

beforeEach(async () => {
  await mongoose.connection.dropDatabase()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoose.connection.close()
})

const app = new App(
  controllers,
  Number(process.env.PORT),
  httpMiddleware,
  false
)

export const request = supertest(app.express)
