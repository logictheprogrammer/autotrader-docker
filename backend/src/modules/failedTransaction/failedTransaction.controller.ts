import { IFailedTransactionService } from '@/modules/failedTransaction/failedTransaction.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'

import validate from '@/modules/failedTransaction/failedTransaction.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class FailedTransactionController implements IAppController {
  public path = '/failed-transaction'
  public router = Router()

  constructor(
    @Inject(ServiceToken.FAILED_TRANSACTION_SERVICE)
    private failedTransactionService: IFailedTransactionService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.patch(
      `${this.path}/update-status/:failedTransactionId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `${this.path}/delete/:failedTransactionId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/all`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll
    )

    this.router.get(
      `${this.path}/:failedTransactionId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetch
    )
  }

  private fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const failedTransactionId = req.params
        .failedTransactionId as unknown as ObjectId
      const response = await this.failedTransactionService.fetch(
        failedTransactionId
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private fetchAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const response = await this.failedTransactionService.fetchAll()
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const failedTransactionId = req.params
        .failedTransactionId as unknown as ObjectId
      const { status } = req.body
      const response = await this.failedTransactionService.updateStatus(
        failedTransactionId,
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
      const failedTransactionId = req.params
        .failedTransactionId as unknown as ObjectId
      const response = await this.failedTransactionService.delete(
        failedTransactionId
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default FailedTransactionController
