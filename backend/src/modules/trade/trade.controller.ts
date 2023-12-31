import { ITradeService } from '@/modules/trade/trade.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import BaseController from '@/core/baseContoller'

@Service()
class TradeController extends BaseController implements IController {
  public path = '/trade'
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
      `/master/demo${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true, UserEnvironment.DEMO)(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:tradeId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true, UserEnvironment.LIVE)(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.TRADE_SERVICE)
    private tradeService: ITradeService
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
      `/master/demo${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.delete(
      `/master${this.path}/delete/:tradeId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
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
    const trade = await this.tradeService.delete({ _id: tradeId })
    return new SuccessResponse('Trade deleted successfully', { trade }).send(
      res
    )
  })
}

export default TradeController
