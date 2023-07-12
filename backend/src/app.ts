import express, { Application } from 'express'
import mongoose from 'mongoose'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import HttpMiddleware from '@/modules/http/http.middleware'
import { IServiceController } from '@/modules/service/service.interface'
import path from 'path'
import cookieParser from 'cookie-parser'
import { doubleCsrfProtection } from '@/utils/csrf'

class App {
  public express: Application

  constructor(
    public controllers: IServiceController[],
    public port: number,
    private httpMiddleware: HttpMiddleware,
    private mongoUri?: string
  ) {
    this.express = express()

    this.initialiseDatabaseConnection()
    this.initialiseMiddleware()
    this.initialiseControllers(controllers)
    this.initialiseStatic()
    this.initialiseErrorHandling()
  }

  private initialiseMiddleware(): void {
    this.express.use(helmet())
    this.express.use(
      cors({
        origin: ['http://localhost:5173'],
        credentials: true,
      })
    )
    this.express.use(morgan('dev'))
    this.express.use(express.json())
    this.express.use(express.urlencoded({ extended: false }))
    this.express.use(compression())
    this.express.use(cookieParser())
    this.express.use(doubleCsrfProtection)
    this.express.get('/token', (req, res, next) => {
      res.json({ token: req.csrfToken && req.csrfToken() })
      next()
    })
  }

  private initialiseControllers(controllers: IServiceController[]): void {
    controllers.forEach((controller: IServiceController) => {
      this.express.use('/api', controller.router)
    })
  }

  private initialiseStatic(): void {
    this.express.use('/images', express.static(path.join(__dirname, 'images')))

    this.express.use((req, res, next) => {
      express.static(path.join(__dirname, 'frontend', 'admin'))(req, res, next)
    })

    this.express.get(/.*/, (req, res) => {
      res.sendFile(path.join(__dirname, 'frontend', 'admin', 'index.html'))
    })
  }

  private initialiseErrorHandling(): void {
    this.express.use(this.httpMiddleware.handle404Error)
    this.express.use(
      this.httpMiddleware.handleThrownError.bind(this.httpMiddleware)
    )
  }

  private async initialiseDatabaseConnection(): Promise<void> {
    if (this.mongoUri) mongoose.connect(`${this.mongoUri}`)
  }

  public listen(): void {
    this.express.listen(this.port, () => {
      console.log(`App listenig on port ${this.port}`)
    })
  }
}

export default App
