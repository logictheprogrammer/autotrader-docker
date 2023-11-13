import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import ServiceToken from '@/core/serviceToken'
import { IController, IControllerRoute } from '@/core/utils'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import BaseController from '@/core/baseContoller'

@Service()
class TransactionController extends BaseController implements IController {
  public path = '/transaction'
  public routes: IControllerRoute[] = [
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false, UserEnvironment.LIVE)(...params),
    ],
    [
      'get',
      `/demo${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false, UserEnvironment.DEMO)(...params),
    ],
    [
      'get',
      `/master/demo${this.path}/users`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true, UserEnvironment.DEMO)(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:transactionId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(...params),
    ],
    [
      'get',
      `/master${this.path}/users`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true, UserEnvironment.LIVE)(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService
  ) {
    super()
    this.initialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
    )

    this.router.get(
      `/demo${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )
    this.router.get(
      `/master/demo${this.path}/users`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.delete(
      `/master${this.path}/delete/:transactionId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `/master${this.path}/users`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
    )
  }

  private fetchAll = (byAdmin: boolean, environment: UserEnvironment) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let transactions

      if (byAdmin) {
        transactions = await this.transactionService.fetchAll({ environment })
      } else {
        transactions = await this.transactionService.fetchAll({
          environment,
          user: req.user._id,
        })
      }

      return new SuccessResponse('Transactions fetched successfully', {
        transactions,
      }).send(res)
    })

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const transactionId = req.params.transactionId
    const transaction = await this.transactionService.delete({
      _id: transactionId,
    })
    return new SuccessResponse('Transaction deleted successfully', {
      transaction,
    }).send(res)
  })
}

export default TransactionController
