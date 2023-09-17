import express, { Application } from 'express'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import HttpMiddleware from '@/modules/http/http.middleware'
import { IAppController } from '@/modules/app/app.interface'
import path from 'path'
import cookieParser from 'cookie-parser'
import { doubleCsrfProtection } from '@/utils/csrf'
import mongodbDatabase from './database/mongodb.database'
import { referralSettingsService, transferSettingsService } from './setup'

class App {
  public express: Application

  constructor(
    public controllers: IAppController[],
    public port: number,
    private httpMiddleware: HttpMiddleware,
    private notTest: boolean,
    private database?: {
      mogodb?: string
    }
  ) {
    this.express = express()

    this.beforeStart().then(() => {
      this.initialiseMiddleware()
      this.initialiseControllers(controllers)
      this.initialiseStatic()
      this.initialiseErrorHandling()
    })
  }

  private initialiseMiddleware(): void {
    this.express.use(helmet())
    this.express.use(
      cors({
        origin: [
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175',
        ],
        credentials: true,
      })
    )
    this.express.use(morgan('dev'))
    this.express.use(express.json())
    this.express.use(express.urlencoded({ extended: false }))
    this.express.use(compression())
    this.express.use(cookieParser())
    if (this.notTest) this.express.use(doubleCsrfProtection)
    this.express.get('/api/token', (req, res, next) => {
      res.json({ token: req.csrfToken && req.csrfToken() })
    })
  }

  private initialiseControllers(controllers: IAppController[]): void {
    controllers.forEach((controller: IAppController) => {
      this.express.use('/api', controller.router)
    })
  }

  private initialiseStatic(): void {
    this.express.use('/images', express.static(path.join(__dirname, 'images')))
  }

  private initialiseErrorHandling(): void {
    this.express.use(this.httpMiddleware.handle404Error)
    this.express.use(
      this.httpMiddleware.handleThrownError.bind(this.httpMiddleware)
    )
  }

  private async initialiseDatabaseConnection(): Promise<void> {
    if (!this.database) return
    if (this.database.mogodb) mongodbDatabase(this.database.mogodb)
  }

  private async beforeStart(): Promise<void> {
    await this.initialiseDatabaseConnection()
    const transferSettings = await transferSettingsService.get()
    if (!transferSettings && this.notTest) {
      await transferSettingsService.create(false, 0)
    }
    const referralSettings = await referralSettingsService.get()
    if (!referralSettings && this.notTest) {
      await referralSettingsService.create(10, 5, 15, 10, 10)
    }
  }

  public listen(): void {
    this.express.listen(this.port, () => {
      console.log(`App listenig on port ${this.port}`)
    })
  }
}

export default App
