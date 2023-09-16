import { ITransferService } from '@/modules/transfer/transfer.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'

import validate from '@/modules/transfer/transfer.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class TransferController implements IAppController {
  public path = '/transfer'
  public router = Router()

  constructor(
    @Inject(ServiceToken.TRANSFER_SERVICE)
    private transferService: ITransferService
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
      `${this.path}/delete/:transferId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true)
    )

    this.router.get(
      `${this.path}/:transferId`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetch(false)
    )

    this.router.get(
      `${this.path}/master/:transferId`,
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
          response = await this.transferService.fetchAll(true)
        } else {
          const userId = req.user._id
          response = await this.transferService.fetchAll(false, userId)
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
        const transferId = req.params.transferId as unknown as ObjectId
        if (isAdmin) {
          response = await this.transferService.fetch(true, transferId)
        } else {
          const userId = req.user._id
          response = await this.transferService.fetch(false, transferId, userId)
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
      const { toUserUsername, amount, account } = req.body
      const userId = req.user._id
      const response = await this.transferService.create(
        userId,
        toUserUsername,
        account,
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
      const { transferId, status } = req.body
      const response = await this.transferService.updateStatus(
        transferId,
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
      const transferId = req.params.transferId as unknown as ObjectId
      const response = await this.transferService.delete(transferId)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default TransferController
