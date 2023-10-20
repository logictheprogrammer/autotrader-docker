import express, { Application, NextFunction, Request, Response } from 'express'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import path from 'path'
import cookieParser from 'cookie-parser'
import { referralSettingsService, transferSettingsService } from './setup'
import mongoose from 'mongoose'
import { IController } from '@/core/utils'
import { doubleCsrfProtection } from '@/helpers/csrf'
import {
  ApiError,
  InternalError,
  NotFoundError,
  ServiceError,
} from '@/core/apiError'

class App {
  public express: Application

  constructor(
    public controllers: IController[],
    public port: number,
    private isTest: boolean,
    private database?: {
      mogodbUri: string
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
    if (!this.isTest) this.express.use(doubleCsrfProtection)
    this.express.get('/api/token', (req, res, next) => {
      res.json({ token: req.csrfToken && req.csrfToken() })
    })
  }

  private initialiseControllers(controllers: IController[]): void {
    controllers.forEach((controller: IController) => {
      this.express.use('/api', controller.router)
    })
  }

  private initialiseStatic(): void {
    this.express.use('/images', express.static(path.join(__dirname, 'images')))
  }

  private initialiseErrorHandling(): void {
    // 404 Error
    this.express.use((req, res, next) =>
      next(
        new NotFoundError(
          'Sorry, the resourse you requested could not be found.'
        )
      )
    )

    // Catch thrown Errors
    this.express.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        let defaultMessage
        if (err instanceof ServiceError) {
          defaultMessage = err.message
          err = err.error
        }
        if (err instanceof ApiError) {
          ApiError.handle(err, res)
        } else {
          ApiError.notifyDeveloper(err)
          ApiError.handle(new InternalError(defaultMessage), res)
        }
      }
    )
  }

  private async initialiseDatabaseConnection(): Promise<void> {
    if (!this.database) return
    try {
      if (this.database.mogodbUri)
        await mongoose.connect(`${this.database.mogodbUri}`)
      console.log('DB CONNECTED')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  private async beforeStart(): Promise<void> {
    await this.initialiseDatabaseConnection()
    const transferSettings = await transferSettingsService.fetch({})
    if (!transferSettings && !this.isTest) {
      await transferSettingsService.create(false, 0)
    }
    const referralSettings = await referralSettingsService.fetch({})
    if (!referralSettings && !this.isTest) {
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
