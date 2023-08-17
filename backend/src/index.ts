import 'dotenv/config'
import 'module-alias/register'
import validateEnv from '@/utils/validateEnv'
import App from './app'
import { controllers, httpMiddleware } from './setup'

validateEnv()

const { MONGO_PATH, PORT } = process.env

const app = new App(controllers, Number(PORT), httpMiddleware, true, MONGO_PATH)

app.listen()
