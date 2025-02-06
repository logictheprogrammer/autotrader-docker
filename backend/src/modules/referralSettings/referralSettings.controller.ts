import { Service, Inject } from 'typedi'
import validate from '@/modules/referralSettings/referralSettings.validation'
import { Response } from 'express'
import { IReferralSettingsService } from '@/modules/referralSettings/referralSettings.interface'
import { UserRole } from '@/modules/user/user.enum'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseController'

@Service()
export default class ReferralSettingsController
  extends BaseController
  implements IController
{
  public path = '/referral-settings'
  public routes: IControllerRoute[] = [
    ['get', `${this.path}`, (...params) => this.fetch(...params)],
    [
      'put',
      `/master${this.path}/update`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      (...params) => this.update(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.REFERRAL_SETTINGS_SERVICE)
    private referralSettingsService: IReferralSettingsService
  ) {
    super()
    this.initializeRoutes()
  }

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const { deposit, stake, winnings, investment, completedPackageEarnings } =
      req.body

    const referralSettings = await this.referralSettingsService.update(
      +deposit,
      +stake,
      +winnings,
      +investment,
      +completedPackageEarnings
    )
    return new SuccessResponse('Referral settings updated successfully', {
      referralSettings,
    }).send(res)
  })

  private fetch = asyncHandler(async (req, res): Promise<Response | void> => {
    const referralSettings = await this.referralSettingsService.fetch({})
    return new SuccessResponse('Referral settings fetched successfully', {
      referralSettings,
    }).send(res)
  })
}
