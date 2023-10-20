import { Service, Inject } from 'typedi'
import validate from '@/modules/referralSettings/referralSettings.validation'
import { Response, Router } from 'express'
import { IReferralSettingsService } from '@/modules/referralSettings/referralSettings.interface'
import { UserRole } from '@/modules/user/user.enum'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
export default class ReferralSettingsController implements IController {
  public path = '/referral-settings'
  public router = Router()

  constructor(
    @Inject(ServiceToken.REFERRAL_SETTINGS_SERVICE)
    private referralSettingsService: IReferralSettingsService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    this.router.put(
      `${this.path}/update`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )

    this.router.get(`${this.path}`, this.fetch)
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
