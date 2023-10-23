import { IDepositService } from '@/modules/deposit/deposit.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/deposit/deposit.validation'
import { UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'

@Service()
class DepositController implements IController {
  public path = '/deposit'
  public router = Router()

  constructor(
    @Inject(ServiceToken.DEPOSIT_SERVICE)
    private depositService: IDepositService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.create),
      this.create
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false)
    )

    this.router.patch(
      `/master${this.path}/update-status/:depositId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `/master${this.path}/delete/:depositId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true)
    )
  }

  private fetchAll = (all: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let deposits
      if (all) {
        deposits = await this.depositService.fetchAll({})
      } else {
        const userId = req.user._id
        deposits = await this.depositService.fetchAll({ user: userId })
      }
      return new SuccessResponse('Deposit transactions fetched successfully', {
        deposits,
      }).send(res)
    })

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { amount, depositMethodId } = req.body
    const userId = req.user._id
    const deposit = await this.depositService.create(
      depositMethodId,
      userId,
      amount
    )
    return new SuccessCreatedResponse('Deposit registered successfully', {
      deposit,
    }).send(res)
  })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { status } = req.body
      const { depositId } = req.params
      const deposit = await this.depositService.updateStatus(
        { _id: depositId as unknown as ObjectId },
        status
      )
      return new SuccessResponse('deposit status upated successfully', {
        deposit,
      }).send(res)
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const depositId = req.params.depositId as unknown as ObjectId
    const deposit = await this.depositService.delete({ _id: depositId })
    return new SuccessResponse('Deposit transcation deleted successfully', {
      deposit,
    }).send(res)
  })
}

export default DepositController
