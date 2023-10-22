import { IAssetService } from '@/modules/asset/asset.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/asset/asset.validation'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import { ObjectId } from 'mongoose'

@Service()
class AssetController implements IController {
  public path = '/asset'
  public router = Router()

  constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.put(
      `${this.path}/update/:assetId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )

    this.router.get(
      `${this.path}`,
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
