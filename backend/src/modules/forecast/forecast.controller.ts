import { IForecastService } from '@/modules/forecast/forecast.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/forecast/forecast.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class ForecastController implements IAppController {
  public path = '/forecast'
  public router = Router()

  constructor(
    @Inject(ServiceToken.FORECAST_SERVICE)
    private forecastService: IForecastService
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

    this.router.put(
      `${this.path}/update`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.update),
      this.update
    )

    this.router.delete(
      `${this.path}/delete/:forecastId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll
    )
  }

  private fetchAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { planId } = req.body
      const response = await this.forecastService.fetchAll(planId)
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
      const { investmentId, pairId, stake, profit } = req.body
      const response = await this.forecastService.createManual(
        investmentId,
        pairId,
        stake,
        profit
      )
      res.status(201).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        forecastId,
        pairId,
        move,
        stake,
        profit,
        openingPrice,
        closingPrice,
        startTime,
        stopTime,
      } = req.body
      const response = await this.forecastService.updateManual(
        forecastId,
        pairId,
        move,
        stake,
        profit,
        openingPrice,
        closingPrice,
        startTime,
        stopTime
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const forecastId = req.params.forecastId as unknown as ObjectId
      const response = await this.forecastService.delete(forecastId)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default ForecastController
