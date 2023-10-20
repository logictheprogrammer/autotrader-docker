import { NextFunction, Request, Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { IReferralService } from '@/modules/referral/referral.interface'
import { UserRole } from '../user/user.enum'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'

@Service()
class ReferralController implements IController {
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
      routePermission(UserRole.ADMIN),
      this.fetchAll(true)
    )

    // Get Referral Earnings
    this.router.get(
      `${this.path}/earnings`,
      routePermission(UserRole.USER),
      this.earnings(false)
    )

    // Get Users Referral Earnings
    this.router.get(
      `${this.path}/earnings/users`,
      routePermission(UserRole.ADMIN),
      this.earnings(true)
    )

    // Get Leaderboard
    this.router.get(
      `${this.path}/leaderboard`,
      routePermission(UserRole.ADMIN),
      this.leaderboard
    )

    // Get Referral Transactions
    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false)
    )
  }

  private fetchAll = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let referrals
      if (byAdmin) {
        referrals = await this.referralService.fetchAll({})
      } else {
        referrals = await this.referralService.fetchAll({ user: req.user._id })
      }
      return new SuccessResponse('Referrals', { referrals }).send(res)
    })

  private earnings = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let referralEarnings
      if (byAdmin) {
        referralEarnings = await this.referralService.earnings({})
      } else {
        referralEarnings = await this.referralService.earnings({
          user: req.user._id,
        })
      }
      return new SuccessResponse('Referral earnings fetched successfully', {
        referralEarnings,
      }).send(res)
    })

  private leaderboard = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const referralLeaderboard = await this.referralService.leaderboard({})

      return new SuccessResponse('Referral leaderboard fetched successfully', {
        referralLeaderboard,
      }).send(res)
    }
  )
}

export default ReferralController
