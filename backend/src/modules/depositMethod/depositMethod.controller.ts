import { IDepositMethodService } from '@/modules/depositMethod/depositMethod.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/depositMethod/depositMethod.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class DepositMethodController implements IAppController {
  public path = '/deposit-method'
  public router = Router()

  constructor(
    @Inject(ServiceToken.DEPOSIT_METHOD_SERVICE)
    private depositMethodService: IDepositMethodService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.create),
      this.create
    )

    this.router.patch(
      `${this.path}/update-status`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateStatus),
      this.updateStatus
    )

    this.router.patch(
      `${this.path}/update-price`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updatePrice),
      this.updatePrice
    )

    this.router.patch(
      `${this.path}/update-mode`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.updateMode),
      this.updateMode
    )

    this.router.put(
      `${this.path}/update`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.update),
      this.update
    )

    // Delete Deposit Method
    this.router.delete(
      `${this.path}/delete/:depositMethodId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true)
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
          response = await this.depositMethodService.fetchAll(true)
        } else {
          response = await this.depositMethodService.fetchAll(false)
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
      const { currencyId, address, network, fee, minDeposit } = req.body
      const response = await this.depositMethodService.create(
        currencyId,
        address,
        network,
        fee,
        minDeposit
      )
      res.status(201).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { depositMethodId, currencyId, address, network, fee, minDeposit } =
        req.body
      const response = await this.depositMethodService.update(
        depositMethodId,
        currencyId,
        address,
        network,
        fee,
        minDeposit
      )
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
      const { depositMethodId, status } = req.body
      const response = await this.depositMethodService.updateStatus(
        depositMethodId,
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
  ): Promise<void> => {
    try {
      const depositMethodId = req.params.depositMethodId as unknown as ObjectId
      const responce = await this.depositMethodService.delete(depositMethodId)
      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private updateMode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { depositMethodId, autoUpdate } = req.body
      const response = await this.depositMethodService.updateMode(
        depositMethodId,
        autoUpdate
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private updatePrice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { depositMethodId, price } = req.body
      const response = await this.depositMethodService.updatePrice(
        depositMethodId,
        price
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default DepositMethodController
