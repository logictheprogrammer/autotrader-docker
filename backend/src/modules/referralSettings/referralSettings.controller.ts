import ServiceToken from '@/utils/enums/serviceToken'
import { Service, Inject } from 'typedi'
import validate from '@/modules/referralSettings/referralSettings.validation'
import { NextFunction, Request, Response, Router } from 'express'
import { IReferralSettingsService } from '@/modules/referralSettings/referralSettings.interface'
import { IServiceController } from '@/modules/service/service.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
export default class ReferralSettingsController implements IServiceController {
  public path = '/referral-settings'
  public router = Router()

  constructor(
    @Inject(ServiceToken.REFERRAL_SETTINGS_SERVICE)
    private referralSettingsService: IReferralSettingsService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    // this.router.post(
    //   `${this.path}/create`,
    //   HttpMiddleware.authenticate(UserRole.ADMIN),
    //   HttpMiddleware.validate(validate.create),
    //   this.create
    // )

    this.router.put(
      `${this.path}/update`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.update),
      this.update
    )

    this.router.get(`${this.path}`, this.fetch)
  }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { deposit, stake, winnings, investment, completedPackageEarnings } =
        req.body

      const response = await this.referralSettingsService.create(
        +deposit,
        +stake,
        +winnings,
        +investment,
        +completedPackageEarnings
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
      const { deposit, stake, winnings, investment, completedPackageEarnings } =
        req.body

      const response = await this.referralSettingsService.update(
        +deposit,
        +stake,
        +winnings,
        +investment,
        +completedPackageEarnings
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const response = await this.referralSettingsService.fetch()
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}
