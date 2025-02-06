import { IAssetService } from '@/modules/asset/asset.interface'
import { Inject, Service } from 'typedi'
import { Response } from 'express'
import validate from '@/modules/asset/asset.validation'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import BaseController from '@/core/baseController'

@Service()
class AssetController extends BaseController implements IController {
  public path = '/asset'
  public routes: IControllerRoute[] = [
    [
      'post',
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      (...params) => this.create(...params),
    ],
    [
      'put',
      `/master${this.path}/update/:assetId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      (...params) => this.update(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {
    super()
    this.initializeRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.put(
      `/master${this.path}/update/:assetId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )

    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll
    )
  }

  private fetchAll = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const assets = await this.assetService.fetchAll({})
      return new SuccessResponse('Assets fetched successfully', {
        assets,
      }).send(res)
    }
  )

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { name, symbol, logo, type } = req.body

    const asset = await this.assetService.create(name, symbol, logo, type)
    return new SuccessCreatedResponse('Asset created successfully', {
      asset,
    }).send(res)
  })

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const { name, symbol, logo, type } = req.body
    const { assetId } = req.params

    const asset = await this.assetService.update(
      { _id: assetId },
      name,
      symbol,
      logo,
      type
    )
    return new SuccessResponse('Asset updated successfully', { asset }).send(
      res
    )
  })
}

export default AssetController
