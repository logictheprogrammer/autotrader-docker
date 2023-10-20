import { IWithdrawalService } from '@/modules/withdrawal/withdrawal.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'

import validate from '@/modules/withdrawal/withdrawal.validation'
import { UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
class WithdrawalController implements IController {
  public path = '/withdrawal'
  public router = Router()

  constructor(
    @Inject(ServiceToken.WITHDRAWAL_SERVICE)
    private withdrawalService: IWithdrawalService
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

    this.router.patch(
      `${this.path}/update-status/:withdrawalId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `${this.path}/delete/:withdrawalId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true)
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false)
    )
  }

  private fetchAll = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let withdrawals
      if (byAdmin) {
        withdrawals = await this.withdrawalService.fetchAll({})
      } else {
        const userId = req.user._id
        withdrawals = await this.withdrawalService.fetchAll({ _id: userId })
      }
      return new SuccessResponse('Withdrawals fetched successfully', {
        withdrawals,
      }).send(res)
    })

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { withdrawalMethodId, address, amount, account } = req.body
    const userId = req.user._id
    const withdrawal = await this.withdrawalService.create(
      withdrawalMethodId,
      userId,
      account,
      address,
      amount
    )
    return new SuccessCreatedResponse('Withdrawal registered successfully', {
      withdrawal,
    }).send(res)
  })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { withdrawalId, status } = req.body
      const withdrawal = await this.withdrawalService.updateStatus(
        withdrawalId,
        status
      )
      return new SuccessResponse('', { withdrawal }).send(res)
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const withdrawalId = req.params.withdrawalId as unknown as ObjectId
    const withdrawal = await this.withdrawalService.delete({
      _id: withdrawalId,
    })
    return new SuccessResponse('Withdrawal transaction deleted successfully', {
      withdrawal,
    }).send(res)
  })
}

export default WithdrawalController
