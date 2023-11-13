import { IWithdrawalService } from '@/modules/withdrawal/withdrawal.interface'
import { Inject, Service } from 'typedi'
import { Response } from 'express'
import validate from '@/modules/withdrawal/withdrawal.validation'
import { UserRole } from '@/modules/user/user.enum'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseContoller'

@Service()
class WithdrawalController extends BaseController implements IController {
  public path = '/withdrawal'
  public routes: IControllerRoute[] = [
    [
      'post',
      `${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.create),
      (...params) => this.create(...params),
    ],
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false)(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-status/:withdrawalId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      (...params) => this.updateStatus(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:withdrawalId`,
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
    @Inject(ServiceToken.WITHDRAWAL_SERVICE)
    private withdrawalService: IWithdrawalService
  ) {
    super()
    this.initialiseRoutes()
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
      `/master${this.path}/update-status/:withdrawalId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `/master${this.path}/delete/:withdrawalId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true)
    )
  }

  private fetchAll = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let withdrawals
      if (byAdmin) {
        withdrawals = await this.withdrawalService.fetchAll({})
      } else {
        const userId = req.user._id
        withdrawals = await this.withdrawalService.fetchAll({ user: userId })
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
      const { status } = req.body
      const { withdrawalId } = req.params
      const withdrawal = await this.withdrawalService.updateStatus(
        { _id: withdrawalId },
        status
      )
      return new SuccessResponse('Status updated successfully', {
        withdrawal,
      }).send(res)
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const withdrawalId = req.params.withdrawalId
    const withdrawal = await this.withdrawalService.delete({
      _id: withdrawalId,
    })
    return new SuccessResponse('Withdrawal transaction deleted successfully', {
      withdrawal,
    }).send(res)
  })
}

export default WithdrawalController
