import { ITradeService } from '@/modules/trade/trade.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'

@Service()
class TradeController implements IController {
  public path = '/trade'
  public router = Router()

  constructor(
    @Inject(ServiceToken.TRADE_SERVICE)
    private tradeService: ITradeService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.delete(
      `${this.path}/delete/:tradeId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master/demo`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/demo`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/master`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
    )
  }

  private fetchAll = (byAdmin: boolean, environment: UserEnvironment) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let trades

      if (byAdmin) {
        trades = await this.tradeService.fetchAll({ environment })
      } else {
        trades = await this.tradeService.fetchAll({
          environment,
          user: req.user._id,
        })
      }

      return new SuccessResponse('Trades fetched successfully', {
        trades,
      }).send(res)
    })

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const tradeId = req.params.tradeId as unknown as ObjectId
    const trade = await this.tradeService.delete(tradeId)
    return new SuccessResponse('Trade deleted successfully', { trade }).send(
      res
    )
  })
}

export default TradeController
