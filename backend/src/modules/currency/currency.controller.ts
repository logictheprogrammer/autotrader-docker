import { ICurrencyService } from '@/modules/currency/currency.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/currency/currency.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
class CurrencyController implements IAppController {
  public path = '/currency'
  public router = Router()

  constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.create),
      this.create
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll
    )
  }

  private fetchAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const response = await this.currencyService.fetchAll()
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { name, symbol, logo } = req.body
      const response = await this.currencyService.create(name, symbol, logo)
      res.status(201).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default CurrencyController
