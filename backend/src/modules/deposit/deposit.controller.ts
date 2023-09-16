import { IDepositService } from '@/modules/deposit/deposit.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/deposit/deposit.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class DepositController implements IAppController {
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
      `${this.path}/delete/:depositId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true)
    )

    this.router.get(
      `${this.path}/:depositId`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetch(false)
    )

    this.router.get(
      `${this.path}/master/:depositId`,
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
          response = await this.depositService.fetchAll(true)
        } else {
          const userId = req.user._id
          response = await this.depositService.fetchAll(false, userId)
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
        const depositId = req.params.depositId as unknown as ObjectId
        if (isAdmin) {
          response = await this.depositService.fetch(true, depositId)
        } else {
          const userId = req.user._id
          response = await this.depositService.fetch(false, depositId, userId)
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
      const { depositMethodId, amount } = req.body
      const userId = req.user._id
      const response = await this.depositService.create(
        depositMethodId,
        userId,
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
      const { depositId, status } = req.body
      const response = await this.depositService.updateStatus(depositId, status)
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
      const depositId = req.params.depositId as unknown as ObjectId
      const response = await this.depositService.delete(depositId)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default DepositController
