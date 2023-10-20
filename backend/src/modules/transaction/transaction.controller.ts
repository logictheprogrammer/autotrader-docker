import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'

import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import ServiceToken from '@/core/serviceToken'
import { IController } from '@/core/utils'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'

@Service()
class TransactionController implements IController {
  public path = '/transaction'
  public router = Router()

  constructor(
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.delete(
      `${this.path}/delete/:transactionId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/demo/all`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/all`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
    )

    this.router.get(
      `${this.path}/demo`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
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
    return new SuccessResponse('Transaction delted successfully', {
      transaction,
    }).send(res)
  })
}

export default TransactionController
