import { Router } from 'express'
import { IControllerRoute } from './utils'

export default abstract class BaseController {
  public router = Router()
  public routes: IControllerRoute[] = []

  protected initializeRoutes() {
    this.routes.forEach(([method, path, ...middlewares]) => {
      this.router[method](path, ...middlewares)
    })
  }
}
