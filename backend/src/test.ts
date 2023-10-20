import validateEnv from './helpers/validateEnv'
import 'dotenv/config'
import 'module-alias/register'
import { controllers } from './setup'
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

const app = new App(controllers, Number(process.env.PORT), true)

export const request = supertest(app.express)
