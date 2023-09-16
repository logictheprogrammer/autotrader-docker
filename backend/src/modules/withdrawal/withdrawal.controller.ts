import { IWithdrawalService } from '@/modules/withdrawal/withdrawal.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'

import validate from '@/modules/withdrawal/withdrawal.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class WithdrawalController implements IAppController {
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
      HttpMiddleware.authenticate(UserRole.USER),
      HttpMiddleware.validate(validate.create),
      this.create
    )

    this.router.patch(
      `${this.path}/update-status`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `${this.path}/delete/:withdrawalId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true)
    )

    this.router.get(
      `${this.path}/:withdrawalId`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetch(false)
    )

    this.router.get(
      `${this.path}/master/:withdrawalId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetch(true)
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false)
    )
  }

  private fetchAll =
    (all: boolean) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        let response
        if (all) {
          response = await this.withdrawalService.fetchAll(true)
        } else {
          const userId = req.user._id
          response = await this.withdrawalService.fetchAll(false, userId)
        }
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private fetch =
    (isAdmin: boolean) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        let response
        const withdrawalId = req.params.withdrawalId as unknown as ObjectId
        if (isAdmin) {
          response = await this.withdrawalService.fetch(true, withdrawalId)
        } else {
          const userId = req.user._id
          response = await this.withdrawalService.fetch(
            false,
            withdrawalId,
            userId
          )
        }
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { withdrawalMethodId, address, amount, account } = req.body
      const userId = req.user._id
      const response = await this.withdrawalService.create(
        withdrawalMethodId,
        userId,
        account,
        address,
        amount
      )
      res.status(201).json(response)
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
      const { withdrawalId, status } = req.body
      const response = await this.withdrawalService.updateStatus(
        withdrawalId,
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
      const withdrawalId = req.params.withdrawalId as unknown as ObjectId
      const response = await this.withdrawalService.delete(withdrawalId)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default WithdrawalController
