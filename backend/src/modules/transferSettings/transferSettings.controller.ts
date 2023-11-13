import { Service, Inject } from 'typedi'
import validate from '@/modules/transferSettings/transferSettings.validation'
import { Response, Router } from 'express'
import { ITransferSettingsService } from '@/modules/transferSettings/transferSettings.interface'
import { UserRole } from '@/modules/user/user.enum'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseContoller'

@Service()
export default class TransferSettingsController
  extends BaseController
  implements IController
{
  public path = '/transfer-settings'
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
    @Inject(ServiceToken.TRANSFER_SETTINGS_SERVICE)
    private transferSettingsService: ITransferSettingsService
  ) {
    super()
    this.initialiseRoutes()
  }

  private initsialiseRoutes = (): void => {
    this.router.get(`${this.path}`, this.fetch)

    this.router.put(
      `/master${this.path}/update`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )
  }

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const { approval, fee } = req.body

    const transferSettings = await this.transferSettingsService.update(
      approval,
      +fee
    )
    return new SuccessResponse('Transfer settings updated successfully', {
      transferSettings,
    }).send(res)
  })

  private fetch = asyncHandler(async (req, res): Promise<Response | void> => {
    const transferSettings = await this.transferSettingsService.fetch({})
    return new SuccessResponse('Transfer status fetched successfully', {
      transferSettings,
    }).send(res)
  })
}
