import { ITradeService } from '@/modules/trade/trade.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/trade/trade.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class TradeController implements IAppController {
  public path = '/trade'
  public router = Router()

  constructor(
    @Inject(ServiceToken.TRADE_SERVICE)
    private tradeService: ITradeService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    // this.router.post(
    //   `${this.path}/create`,
    //   HttpMiddleware.authenticate(UserRole.ADMIN),
    //   HttpMiddleware.validate(validate.create),
    //   this.create
    // )

    // this.router.put(
    //   `${this.path}/update`,
    //   HttpMiddleware.authenticate(UserRole.ADMIN),
    //   HttpMiddleware.validate(validate.update),
    //   this.update
    // )

    // this.router.patch(
    //   `${this.path}/update-amount`,
    //   HttpMiddleware.authenticate(UserRole.ADMIN),
    //   HttpMiddleware.validate(validate.updateAmount),
    //   this.updateAmount
    // )

    this.router.delete(
      `${this.path}/delete/:tradeId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master/demo`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/demo`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/master`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
    )
  }

  private fetchAll =
    (all: boolean, environment: UserEnvironment) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const userId = req.user._id
        const response = await this.tradeService.fetchAll(
          all,
          environment,
          userId
        )
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  // private create = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | void> => {
  //   try {
  //     const { investmentId, pairId, stake, profit } = req.body
  //     const response = await this.tradeService.createManual(
  //       investmentId,
  //       pairId,
  //       stake,
  //       profit
  //     )
  //     res.status(201).json(response)
  //   } catch (err: any) {
  //     next(new HttpException(err.status, err.message, err.statusStrength))
  //   }
  // }

  // private update = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | void> => {
  //   try {
  //     const {
  //       tradeId,
  //       pairId,
  //       move,
  //       stake,
  //       profit,
  //       openingPrice,
  //       closingPrice,
  //       startTime,
  //       stopTime,
  //     } = req.body
  //     const response = await this.tradeService.updateManual(
  //       tradeId,
  //       pairId,
  //       move,
  //       stake,
  //       profit,
  //       openingPrice,
  //       closingPrice,
  //       startTime,
  //       stopTime
  //     )
  //     res.status(200).json(response)
  //   } catch (err: any) {
  //     next(new HttpException(err.status, err.message, err.statusStrength))
  //   }
  // }

  // private updateAmount = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response | void> => {
  //   try {
  //     const { tradeId, stake, profit } = req.body
  //     const response = await this.tradeService.updateAmount(
  //       tradeId,
  //       stake,
  //       profit
  //     )
  //     res.status(200).json(response)
  //   } catch (err: any) {
  //     next(new HttpException(err.status, err.message, err.statusStrength))
  //   }
  // }

  private delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const tradeId = req.params.tradeId as unknown as ObjectId
      const response = await this.tradeService.delete(tradeId)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default TradeController
