import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'

import validate from '@/modules/transaction/transaction.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class TransactionController implements IAppController {
  public path = '/transaction'
  public router = Router()

  constructor(
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.patch(
      `${this.path}/force-update-status`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateStatus),
      this.forceUpdateStatus
    )

    this.router.patch(
      `${this.path}/force-update-amount`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateAmount),
      this.forceUpdateAmount
    )

    this.router.delete(
      `${this.path}/delete/:transactionId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/demo/all`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/all`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
    )

    this.router.get(
      `${this.path}/demo`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
    )
  }

  private fetchAll =
    (fromAllAccounts: boolean, environment: UserEnvironment) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const userId = req.user._id

        const response = await this.transactionService.fetchAll(
          fromAllAccounts,
          environment,
          userId
        )
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private forceUpdateAmount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { transactionId, status, amount } = req.body
      const response = await this.transactionService.forceUpdateAmount(
        transactionId,
        status,
        amount
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private forceUpdateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { transactionId, status } = req.body
      const response = await this.transactionService.forceUpdateStatus(
        transactionId,
        status
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const transactionId = req.params.transactionId as unknown as ObjectId
      const response = await this.transactionService.delete(transactionId)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default TransactionController
