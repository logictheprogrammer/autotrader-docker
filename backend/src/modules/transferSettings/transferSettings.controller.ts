import { Service, Inject } from 'typedi'
import validate from '@/modules/transferSettings/transferSettings.validation'
import { Response, Router } from 'express'
import { ITransferSettingsService } from '@/modules/transferSettings/transferSettings.interface'
import { UserRole } from '@/modules/user/user.enum'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
export default class TransferSettingsController implements IController {
  public path = '/transfer-settings'
  public router = Router()

  constructor(
    @Inject(ServiceToken.TRANSFER_SETTINGS_SERVICE)
    private transferSettingsService: ITransferSettingsService
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
