import { IPlanService } from '@/modules/plan/plan.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/plan/plan.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { ObjectId } from 'mongoose'

@Service()
class PlanController implements IAppController {
  public path = '/plans'
  public router = Router()

  constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService
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

    this.router.patch(
      `${this.path}/update-status`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `${this.path}/delete/:planId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(UserRole.ADMIN)
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(UserRole.USER)
    )
  }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        name,
        engine,
        minAmount,
        maxAmount,
        minPercentageProfit,
        maxPercentageProfit,
        duration,
        dailyForecasts,
        gas,
        description,
        assetType,
      } = req.body

      const assets = req.body.assets as ObjectId[]

      const response = await this.planService.create(
        'icon.png',
        name,
        engine,
        minAmount,
        maxAmount,
        minPercentageProfit,
        maxPercentageProfit,
        duration,
        dailyForecasts,
        gas,
        description,
        assetType,
        assets
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
        planId,
        name,
        engine,
        minAmount,
        maxAmount,
        minPercentageProfit,
        maxPercentageProfit,
        duration,
        dailyForecasts,
        gas,
        description,
        assetType,
      } = req.body

      const assets = req.body.assets as ObjectId[]

      const response = await this.planService.update(
        planId,
        'icon.png',
        name,
        engine,
        minAmount,
        maxAmount,
        minPercentageProfit,
        maxPercentageProfit,
        duration,
        dailyForecasts,
        gas,
        description,
        assetType,
        assets
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { planId } = req.body

      const status = req.body.status as PlanStatus

      const response = await this.planService.updateStatus(planId, status)

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
      const planId = req.params.planId as unknown as ObjectId

      const response = await this.planService.delete(planId)

      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private fetchAll =
    (role: UserRole) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const response = await this.planService.fetchAll(role)

        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }
}

export default PlanController
