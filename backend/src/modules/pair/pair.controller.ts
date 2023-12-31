import { IPairService } from '@/modules/pair/pair.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/pair/pair.validation'

import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import ServiceToken from '@/core/serviceToken'
import { IController, IControllerRoute } from '@/core/utils'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseContoller'

@Service()
class PairController extends BaseController implements IController {
  public path = '/pair'
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
      `/master${this.path}/update/:pairId`,
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
    @Inject(ServiceToken.PAIR_SERVICE)
    private pairService: IPairService
  ) {
    super()
    this.initialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.put(
      `/master${this.path}/update/:pairId`,
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
      const pairs = await this.pairService.fetchAll({})
      return new SuccessResponse('Pairs fetched successfully', { pairs }).send(
        res
      )
    }
  )

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { assetType, baseAssetId, quoteAssetId } = req.body
    const pair = await this.pairService.create(
      assetType,
      baseAssetId,
      quoteAssetId
    )
    return new SuccessCreatedResponse('Pair created successfully', {
      pair,
    }).send(res)
  })

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const { assetType, baseAssetId, quoteAssetId } = req.body
    const pair = await this.pairService.update(
      { _id: req.params.pairId },
      assetType,
      baseAssetId,
      quoteAssetId
    )
    return new SuccessResponse('Pair updated successfully', { pair }).send(res)
  })
}

export default PairController
