import {
  IInvestment,
  IInvestmentService,
} from '@/modules/investment/investment.interface'
import { Inject, Service } from 'typedi'
import {
  ITrade,
  ITradeObject,
  ITradeService,
} from '@/modules/trade/trade.interface'
import tradeModel from '@/modules/trade/trade.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { TradeMove, TradeStatus } from '@/modules/trade/trade.enum'
import { IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import { IUser, IUserObject, IUserService } from '@/modules/user/user.interface'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import {
  ITransactionInstance,
  ITransactionManagerService,
} from '@/modules/transactionManager/transactionManager.interface'
import { UserEnvironment } from '@/modules/user/user.enum'
import { THttpResponse } from '@/modules/http/http.type'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { IInvestmentObject } from '../investment/investment.interface'
import { IPairObject, IPairService } from '../pair/pair.interface'
import Helpers from '@/utils/helpers/helpers'
import { IMathService } from '../math/math.interface'
import { InvestmentStatus } from '../investment/investment.enum'
import { TUpdateTradeStatus } from './trade.type'
import userModel from '../user/user.model'
import { TUpdateInvestmentStatus } from '../investment/investment.type'
import { ObjectId } from 'mongoose'

@Service()
class TradeService implements ITradeService {
  private tradeModel = tradeModel
  private userModel = userModel

  public static dailyTrades = 0.1
  public static minStakeRate = 0.1
  public static maxStakeRate = 0.25
  public static profitBreakpoint = 3
  public static profitProbability = 0.5

  public constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService,
    @Inject(ServiceToken.PAIR_SERVICE)
    private pairService: IPairService,
    @Inject(ServiceToken.MATH_SERVICE)
    private mathService: IMathService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.INVESTMENT_SERVICE)
    private investmentService: IInvestmentService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @Inject(ServiceToken.TRANSACTION_MANAGER_SERVICE)
    private transactionManagerService: ITransactionManagerService<any>
  ) {}

  private async find(tradeId: ObjectId): Promise<ITrade> {
    const trade = await this.tradeModel.findById(tradeId)

    if (!trade) throw new HttpException(404, 'Trade not found')

    return trade
  }

  public async _createTransaction(
    plan: IPlanObject,
    pair: IPairObject,
    outcome: number
  ): TTransaction<ITradeObject, ITrade> {
    const trade = new this.tradeModel({
      plan: plan._id,
      planObject: plan,
      pair: pair._id,
      pairObject: pair,
      market: pair.assetType,
      outcome,
      manualMode: plan.manualMode,
    })

    return {
      object: trade.toObject({ getters: true }),
      instance: {
        model: trade,
        onFailed: `Delete the trade with an id of (${trade._id})`,
        callback: async () => {
          await this.tradeModel.deleteOne({ _id: trade._id })
        },
      },
    }
  }

  public async _updateStatusTransaction(
    tradeId: ObjectId,
    status: TradeStatus,
    move?: TradeMove
  ): TTransaction<ITradeObject, ITrade> {
    const trade = await this.find(tradeId)

    const oldStatus = trade.status

    if (oldStatus === TradeStatus.SETTLED)
      throw new HttpException(400, 'This trade has already been settled')

    let startTime: Date | undefined,
      runtime: number,
      oldTimeStamps: number[] = []
    switch (status) {
      case TradeStatus.MARKET_CLOSED:
      case TradeStatus.ON_HOLD:
        startTime = trade.startTime
        runtime =
          new Date().getTime() - (startTime?.getTime() || new Date().getTime())

        oldTimeStamps = trade.timeStamps.slice()
        if (runtime) trade.timeStamps = [...oldTimeStamps, runtime]
        trade.startTime = undefined
        break

      case TradeStatus.RUNNING:
        trade.startTime = new Date()

      case TradeStatus.SETTLED:
        startTime = trade.startTime
        runtime =
          new Date().getTime() - (startTime?.getTime() || new Date().getTime())

        oldTimeStamps = trade.timeStamps.slice()
        if (runtime) trade.timeStamps = [...oldTimeStamps, runtime]
        trade.runTime = trade.timeStamps.reduce((acc, curr) => (acc += curr), 0)
        trade.startTime = undefined
        trade.move = move
    }

    trade.status = status

    return {
      object: trade.toObject({ getters: true }),
      instance: {
        model: trade,
        onFailed: `Set the status of the trade with an id of (${
          trade._id
        }) to (${oldStatus}) and startTime to (${startTime}) and timeStamps to (${JSON.stringify(
          oldTimeStamps
        )}) and move to undefined`,
        callback: async () => {
          trade.status = oldStatus
          trade.startTime = startTime
          trade.timeStamps = oldTimeStamps
          trade.move = undefined
          await trade.save()
        },
      },
    }
  }

  public async autoCreate(planId: ObjectId, pairId: ObjectId): Promise<void> {
    const plan = await this.planService.get(planId)
    const pair = await this.pairService.get(pairId)

    if (!plan) throw new HttpException(404, 'The plan no longer exist')
    if (!pair) throw new HttpException(404, 'The selected pair no longer exist')

    if (pair.assetType !== plan.assetType)
      throw new HttpException(
        400,
        'The pair is not compatible with this plan plan'
      )

    const minProfit = plan.minProfit / (plan.dailyTrades * plan.duration)
    const maxProfit = plan.maxProfit / (plan.dailyTrades * plan.duration)

    const stakeRate = Helpers.getRandomValue(
      TradeService.minStakeRate,
      TradeService.maxStakeRate
    )

    const spread = stakeRate * minProfit

    const breakpoint = spread * TradeService.profitBreakpoint

    const outcome = this.mathService.dynamicRange(
      minProfit,
      maxProfit,
      spread,
      breakpoint,
      TradeService.profitProbability
    )

    const { model: trade } = (
      await this._createTransaction(plan, pair, outcome)
    ).instance

    await trade.save()
  }

  public async manualCreate(
    planId: ObjectId,
    pairId: ObjectId,
    outcome: number
  ): THttpResponse<{ trade: ITrade }> {
    try {
      const plan = await this.planService.get(planId)
      const pair = await this.pairService.get(pairId)

      if (!plan) throw new HttpException(404, 'The plan no longer exist')
      if (!pair)
        throw new HttpException(404, 'The selected pair no longer exist')

      if (pair.assetType !== plan.assetType)
        throw new HttpException(
          400,
          'The pair is not compatible with this plan plan'
        )

      const { model: trade } = (
        await this._createTransaction(plan, pair, outcome)
      ).instance

      await trade.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Trade created successfully',
        data: { trade: trade },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to create this trade, please try again'
      )
    }
  }

  public async manualUpdate(
    tradeId: ObjectId,
    pairId: ObjectId,
    outcome: number,
    status: TradeStatus,
    move?: TradeMove
  ): THttpResponse<{ trade: ITrade }> {
    try {
      const trade = await this.find(tradeId)
      const pair = await this.pairService.get(pairId)
      if (!pair)
        throw new HttpException(404, 'The selected pair no longer exist')

      if (pair.assetType !== trade.market)
        throw new HttpException(
          400,
          'The pair is not compatible with this trade'
        )

      trade.move = move
      trade.outcome = outcome
      trade.status = status
      trade.manualMode = true

      await trade.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Trade updated successfully',
        data: { trade },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this trade, please try again'
      )
    }
  }

  public async updateStatus(
    tradeId: ObjectId,
    status: TradeStatus
  ): Promise<{ model: ITrade; instances: TUpdateTradeStatus }> {
    const transactionInstances: TUpdateTradeStatus = []

    const { instance: tradeInstance } = await this._updateStatusTransaction(
      tradeId,
      status
    )

    transactionInstances.push(tradeInstance)

    return { model: tradeInstance.model, instances: transactionInstances }
  }

  public async delete(tradeId: ObjectId): THttpResponse<{ trade: ITrade }> {
    try {
      const trade = await this.find(tradeId)

      if (trade.status !== TradeStatus.SETTLED)
        throw new HttpException(400, 'Trade has not been settled yet')

      await trade.deleteOne()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Trade deleted successfully',
        data: { trade },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete this trade, please try again'
      )
    }
  }

  public async fetchAll(planId: ObjectId): THttpResponse<{ trades: ITrade[] }> {
    try {
      let trades

      trades = await this.tradeModel
        .find({ plan: planId })
        .select('-planObject -pairObject')
        .populate('plan')
        .populate('pair')

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Trade fetched successfully',
        data: { trades },
      }
    } catch (err: any) {
      throw new AppException(err, 'Failed to fetch trade, please try again')
    }
  }
}

export default TradeService
