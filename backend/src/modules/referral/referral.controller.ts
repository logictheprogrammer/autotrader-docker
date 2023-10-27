import { Response, Router } from 'express'
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
    // Get Referral Earnings
    this.router.get(
      `${this.path}/earnings`,
      routePermission(UserRole.USER),
      this.earnings(false)
    )

    // Get Referral Transactions
    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false)
    )

    // Get Users Referral Earnings
    this.router.get(
      `/master${this.path}/earnings/users`,
      routePermission(UserRole.ADMIN),
      this.earnings(true)
    )

    // Get Leaderboard
    this.router.get(
      `/master${this.path}/leaderboard`,
      routePermission(UserRole.ADMIN),
      this.leaderboard
    )

    // Get Users Referral Transactions
    this.router.get(
      `/master${this.path}/users`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true)
    )

    // Delete Referral Transactions
    this.router.delete(
      `/master${this.path}/delete/:referralId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )
  }

  private fetchAll = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let referrals
      if (byAdmin) {
        referrals = await this.referralService.fetchAll({})
      } else {
        referrals = await this.referralService.fetchAll({
          referrer: req.user._id,
        })
      }
      return new SuccessResponse('Referrals fetched successfully', {
        referrals,
      }).send(res)
    })

  private earnings = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let referralEarnings
      if (byAdmin) {
        referralEarnings = await this.referralService.earnings({})
      } else {
        referralEarnings = await this.referralService.earnings({
          referrer: req.user._id,
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

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const referralId = req.params.referralId
    const referral = await this.referralService.delete({ _id: referralId })
    return new SuccessResponse('Referral transcation deleted successfully', {
      referral,
    }).send(res)
  })
}

export default ReferralController
