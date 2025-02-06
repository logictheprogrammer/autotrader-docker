import { IDepositMethodService } from '@/modules/depositMethod/depositMethod.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/depositMethod/depositMethod.validation'
import { UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { DepositMethodStatus } from './depositMethod.enum'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseController'

@Service()
class DepositMethodController extends BaseController implements IController {
  public path = '/deposit-method'
  public routes: IControllerRoute[] = [
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false)(...params),
    ],
    [
      'post',
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      (...params) => this.create(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-status/:depositMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      (...params) => this.updateStatus(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-price/:depositMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updatePrice),
      (...params) => this.updatePrice(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-mode/:depositMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateMode),
      (...params) => this.updateMode(...params),
    ],
    [
      'put',
      `/master${this.path}/update/:depositMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      (...params) => this.update(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:depositMethodId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true)(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.DEPOSIT_METHOD_SERVICE)
    private depositMethodService: IDepositMethodService
  ) {
    super()
    this.initializeRoutes()
  }

  private fetchAll = (all: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let depositMethods
      if (all) {
        depositMethods = await this.depositMethodService.fetchAll({})
      } else {
        depositMethods = await this.depositMethodService.fetchAll({
          status: DepositMethodStatus.ENABLED,
        })
      }
      return new SuccessResponse('Deposit methods fetched successfully', {
        depositMethods,
      }).send(res)
    })

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { currencyId, address, network, fee, minDeposit } = req.body
    const depositMethod = await this.depositMethodService.create(
      currencyId,
      address,
      network,
      fee,
      minDeposit
    )
    return new SuccessCreatedResponse('Deposit method created successfully', {
      depositMethod,
    }).send(res)
  })

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const { currencyId, address, network, fee, minDeposit } = req.body
    const { depositMethodId } = req.params
    const depositMethod = await this.depositMethodService.update(
      { _id: depositMethodId as unknown as ObjectId },
      currencyId,
      address,
      network,
      fee,
      minDeposit
    )
    return new SuccessResponse('Deposit method updated successfully', {
      depositMethod,
    }).send(res)
  })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { status } = req.body
      const { depositMethodId } = req.params
      const depositMethod = await this.depositMethodService.updateStatus(
        { _id: depositMethodId as unknown as ObjectId },
        status
      )
      return new SuccessResponse('Status updated successfully', {
        depositMethod,
      }).send(res)
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const depositMethodId = req.params.depositMethodId as unknown as ObjectId
    const depositMethod = await this.depositMethodService.delete({
      _id: depositMethodId,
    })
    return new SuccessResponse('Deposit method deleted successfully', {
      depositMethod,
    }).send(res)
  })

  private updateMode = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { autoUpdate } = req.body
      const { depositMethodId } = req.params
      const depositMethod = await this.depositMethodService.updateMode(
        { _id: depositMethodId as unknown as ObjectId },
        autoUpdate
      )
      return new SuccessResponse('Mode updated successfully', {
        depositMethod,
      }).send(res)
    }
  )

  private updatePrice = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { price } = req.body
      const { depositMethodId } = req.params
      const depositMethod = await this.depositMethodService.updatePrice(
        { _id: depositMethodId as unknown as ObjectId },
        price
      )
      return new SuccessResponse('Price updated successfully', {
        depositMethod,
      }).send(res)
    }
  )
}

export default DepositMethodController
