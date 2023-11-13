import { IWithdrawalMethodService } from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { Inject, Service } from 'typedi'
import { Response } from 'express'
import validate from '@/modules/withdrawalMethod/withdrawalMethod.validation'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { WithdrawalMethodStatus } from './withdrawalMethod.enum'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseContoller'

@Service()
class WithdrawalMethodController extends BaseController implements IController {
  public path = '/withdrawal-method'
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
      `/master${this.path}/update-status/:withdrawalMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      (...params) => this.updateStatus(...params),
    ],
    [
      'put',
      `/master${this.path}/update/:withdrawalMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      (...params) => this.update(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:withdrawalMethodId`,
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
    @Inject(ServiceToken.WITHDRAWAL_METHOD_SERVICE)
    private withdrawalMethodService: IWithdrawalMethodService
  ) {
    super()
    this.initialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false)
    )

    this.router.post(
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.patch(
      `/master${this.path}/update-status/:withdrawalMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.put(
      `/master${this.path}/update/:withdrawalMethodId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )

    // Delete Withdrawal Method
    this.router.delete(
      `/master${this.path}/delete/:withdrawalMethodId`,
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
      let withdrawalMethods
      if (byAdmin) {
        withdrawalMethods = await this.withdrawalMethodService.fetchAll({})
      } else {
        withdrawalMethods = await this.withdrawalMethodService.fetchAll({
          status: WithdrawalMethodStatus.ENABLED,
        })
      }
      return new SuccessResponse('Withdrawal methods fetched successfully', {
        withdrawalMethods,
      }).send(res)
    })

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { currencyId, network, fee, minWithdrawal } = req.body
    const withdrawalMethod = await this.withdrawalMethodService.create(
      currencyId,
      network,
      fee,
      minWithdrawal
    )
    return new SuccessCreatedResponse(
      'Withdrawal method created successfully',
      { withdrawalMethod }
    ).send(res)
  })

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const { currencyId, network, fee, minWithdrawal } = req.body
    const { withdrawalMethodId } = req.params
    const withdrawalMethod = await this.withdrawalMethodService.update(
      { _id: withdrawalMethodId },
      currencyId,
      network,
      fee,
      minWithdrawal
    )
    return new SuccessResponse('Withdrawal method updated successfully', {
      withdrawalMethod,
    }).send(res)
  })

  private delete = asyncHandler(async (req, res): Promise<void | Response> => {
    const withdrawalMethodId = req.params.withdrawalMethodId
    const withdrawalMethod = await this.withdrawalMethodService.delete({
      _id: withdrawalMethodId,
    })
    return new SuccessResponse('Withdrawal method deleted successfully', {
      withdrawalMethod,
    }).send(res)
  })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { status } = req.body
      const { withdrawalMethodId } = req.params
      const withdrawalMethod = await this.withdrawalMethodService.updateStatus(
        { _id: withdrawalMethodId },
        status
      )
      return new SuccessResponse('Status updated successfully', {
        withdrawalMethod,
      }).send(res)
    }
  )
}

export default WithdrawalMethodController
