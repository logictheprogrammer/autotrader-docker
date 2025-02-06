import { Response } from 'express'
import { Inject, Service } from 'typedi'
import { IReferralService } from '@/modules/referral/referral.interface'
import { UserRole } from '../user/user.enum'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import BaseController from '@/core/baseController'

@Service()
class ReferralController extends BaseController implements IController {
  public path = '/referral'
  public routes: IControllerRoute[] = [
    [
      'get',
      `${this.path}/earnings`,
      routePermission(UserRole.USER),
      (...params) => this.earnings(false)(...params),
    ],
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false)(...params),
    ],
    [
      'get',
      `/master${this.path}/earnings/users`,
      routePermission(UserRole.ADMIN),
      (...params) => this.earnings(true)(...params),
    ],
    [
      'get',
      `/master${this.path}/leaderboard`,
      routePermission(UserRole.ADMIN),
      (...params) => this.leaderboard(...params),
    ],
    [
      'get',
      `/master${this.path}/users`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true)(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:referralId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.REFERRAL_SERVICE)
    private referralService: IReferralService
  ) {
    super()
    this.initializeRoutes()
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
