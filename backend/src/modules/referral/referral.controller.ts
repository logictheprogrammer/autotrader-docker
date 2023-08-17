import ServiceToken from '@/utils/enums/serviceToken'
import { NextFunction, Request, Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { IReferralService } from '@/modules/referral/referral.interface'
import { IAppController } from '../app/app.interface'
import HttpMiddleware from '../http/http.middleware'
import { UserRole } from '../user/user.enum'
import HttpException from '../http/http.exception'

@Service()
class ReferralController implements IAppController {
  public path = '/referral'
  public router = Router()

  constructor(
    @Inject(ServiceToken.REFERRAL_SERVICE)
    private referralService: IReferralService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    // Get Users Referral Transactions
    this.router.get(
      `${this.path}/users`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true)
    )

    // Get Referral Earnings
    this.router.get(
      `${this.path}/earnings`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.earnings(false)
    )

    // Get Users Referral Earnings
    this.router.get(
      `${this.path}/earnings/users`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.earnings(true)
    )

    // Get Leaderboard
    this.router.get(
      `${this.path}/leaderboard`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.leaderboard
    )

    // Get Referral Transactions
    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false)
    )
  }

  private fetchAll =
    (fromAllAccounts: boolean) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const response = await this.referralService.fetchAll(
          fromAllAccounts,
          req.user._id
        )
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private earnings =
    (fromAllAccounts: boolean) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const response = await this.referralService.earnings(
          fromAllAccounts,
          req.user._id
        )
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private leaderboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const response = await this.referralService.leaderboard()
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default ReferralController
