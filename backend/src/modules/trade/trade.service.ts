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
import { IPlanService } from '@/modules/plan/plan.interface'
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

  private async find(
    tradeId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<ITrade> {
    let trade

    if (fromAllAccounts) {
      trade = await this.tradeModel.findById(tradeId)
    } else {
      trade = await this.tradeModel.findOne({ _id: tradeId, user: userId })
    }

    if (!trade) throw new HttpException(404, 'Trade not found')

    return trade
  }

  public async _createTransaction(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number,
    investmentPercentage: number,
    environment: UserEnvironment
  ): TTransaction<ITradeObject, ITrade> {
    const trade = new this.tradeModel({
      investment: investment._id,
      investmentObject: investment,
      user: user._id,
      userObject: user,
      pair: pair._id,
      pairObject: pair,
      market: pair.assetType,
      stake,
      outcome,
      profit,
      percentage,
      investmentPercentage,
      environment,
      manualMode: investment.manualMode,
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

  public async create(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    stakeRate: number,
    investmentPercentage: number
  ): TTransaction<ITradeObject, ITrade> {
    const amount = investment.amount
    const environment = investment.environment

    const stake = stakeRate * amount

    const profit = (investmentPercentage / 100) * amount

    const outcome = stake + profit

    const percentage = (profit * 100) / stake

    return await this._createTransaction(
      user,
      investment,
      pair,
      stake,
      outcome,
      profit,
      percentage,
      investmentPercentage,
      environment
    )
  }

  public async createAuto(
    investmentId: ObjectId,
    pairId: ObjectId
  ): Promise<void> {
    const investment = await this.investmentService.get(investmentId)
    const pair = await this.pairService.get(pairId)
    const user = await this.userService.get(investment.user)

    if (!pair) throw new HttpException(404, 'The selected pair no longer exist')

    if (pair.assetType !== investment.planObject.assetType)
      throw new HttpException(
        400,
        'The pair is not compatible with this investment plan'
      )

    const minProfit =
      investment.planObject.minProfit /
      (investment.planObject.dailyTrades * investment.planObject.duration)
    const maxProfit =
      investment.planObject.maxProfit /
      (investment.planObject.dailyTrades * investment.planObject.duration)

    const stakeRate = Helpers.getRandomValue(
      TradeService.minStakeRate,
      TradeService.maxStakeRate
    )

    const spread = stakeRate * minProfit

    const breakpoint = spread * TradeService.profitBreakpoint

    const investmentPercentage = this.mathService.dynamicRange(
      minProfit,
      maxProfit,
      spread,
      breakpoint,
      TradeService.profitProbability
    )

    const { model: trade } = (
      await this.create(user, investment, pair, stakeRate, investmentPercentage)
    ).instance

    await trade.save()

    // return {
    //   status: HttpResponseStatus.SUCCESS,
    //   message: 'Trade created successfully',
    //   data: { trade: trade.collectRaw() },
    // }
  }

  public async createManual(
    investmentId: ObjectId,
    pairId: ObjectId,
    stake: number,
    profit: number
  ): THttpResponse<{ trade: ITrade }> {
    try {
      const investment = await this.investmentService.get(investmentId)
      const pair = await this.pairService.get(pairId)
      const user = await this.userService.get(investment.user)

      if (!pair)
        throw new HttpException(404, 'The selected pair no longer exist')

      if (pair.assetType !== investment.planObject.assetType)
        throw new HttpException(
          400,
          'The pair is not compatible with this investment plan'
        )

      const environment = investment.environment
      const outcome = stake + profit
      const percentage = (profit * 100) / stake
      const investmentPercentage = (profit * 100) / investment.amount

      const { model: trade } = (
        await this._createTransaction(
          user,
          investment,
          pair,
          stake,
          outcome,
          profit,
          percentage,
          investmentPercentage,
          environment
        )
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

  public async updateManual(
    tradeId: ObjectId,
    pairId: ObjectId,
    move: TradeMove,
    stake: number,
    profit: number,
    openingPrice?: number | undefined,
    closingPrice?: number | undefined,
    startTime?: Date | undefined,
    stopTime?: Date | undefined
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
      trade.stake = stake
      trade.profit = profit
      trade.openingPrice = openingPrice ?? trade.openingPrice
      trade.closingPrice = closingPrice ?? trade.openingPrice
      trade.startTime = startTime ?? trade.startTime

      trade.outcome = profit + stake
      trade.percentage = (profit * 100) / stake
      trade.investmentPercentage =
        (profit * 100) / trade.investmentObject.amount

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

  public async updateInvestmentStatus(
    investmentId: ObjectId,
    investmentStatus: InvestmentStatus
  ): Promise<{
    model: IInvestment
    instances: TUpdateInvestmentStatus
  }> {
    const { instances, model } = await this.investmentService.updateStatus(
      investmentId,
      investmentStatus
    )

    // When the status stops the investment
    if (
      investmentStatus === InvestmentStatus.SUSPENDED ||
      investmentStatus === InvestmentStatus.INSUFFICIENT_GAS ||
      investmentStatus === InvestmentStatus.ON_MAINTAINACE ||
      investmentStatus === InvestmentStatus.REFILLING
    ) {
      const tradeStillRunning = await this.tradeModel.findOne({
        investment: investmentId,
        status: TradeStatus.RUNNING,
      })

      // stop the trade if it's still running..
      if (tradeStillRunning) {
        const { instance: tradeInstance } = await this._updateStatusTransaction(
          tradeStillRunning._id,
          TradeStatus.ON_HOLD
        )

        instances.push(tradeInstance)
      }
    } else if (investmentStatus === InvestmentStatus.RUNNING) {
      const tradeOnHold = await this.tradeModel.findOne({
        investment: investmentId,
        status: TradeStatus.ON_HOLD,
      })

      // prepare trade if trade is on hold
      if (tradeOnHold) {
        const { instance: tradeInstance } = await this._updateStatusTransaction(
          tradeOnHold._id,
          TradeStatus.PREPARING
        )

        instances.push(tradeInstance)
      }
    }

    return { model, instances }
  }

  public async forceUpdateInvestmentStatus(
    investmentId: ObjectId,
    status: InvestmentStatus
  ): THttpResponse<{ investment: IInvestment }> {
    try {
      const result = await this.updateInvestmentStatus(investmentId, status)

      await this.transactionManagerService.execute(result.instances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Status updated successfully',
        data: { investment: result.model },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this investment  status, please try again'
      )
    }
  }

  public async updateStatus(
    tradeId: ObjectId,
    status: TradeStatus,
    move?: TradeMove
  ): Promise<{ model: ITrade; instances: TUpdateTradeStatus }> {
    const transactionInstances: TUpdateTradeStatus = []

    const { object: trade, instance: tradeInstance } =
      await this._updateStatusTransaction(tradeId, status, move)

    transactionInstances.push(tradeInstance)

    const user = await this.userService.get(trade.user)

    const { instance: investmentInstance } =
      await this.investmentService.updateTradeDetailsTransaction(
        trade.investment,
        trade
      )
    transactionInstances.push(investmentInstance)

    if (status === TradeStatus.SETTLED) {
      const transactionInstance = await this.transactionService.updateAmount(
        trade._id,
        status,
        trade.outcome
      )
      transactionInstances.push(transactionInstance)
    }

    let notificationMessage
    switch (status) {
      case TradeStatus.RUNNING:
        notificationMessage = 'is now running'
        break
      case TradeStatus.MARKET_CLOSED:
        notificationMessage = 'market has closed'
        break
      case TradeStatus.ON_HOLD:
        notificationMessage = 'is currently on hold'
        break
      case TradeStatus.SETTLED:
        notificationMessage = 'has been settled'
        break
    }

    if (notificationMessage) {
      const notificationInstance = await this.notificationService.create(
        `Your investment current trade ${notificationMessage}`,
        NotificationCategory.TRADE,
        trade,
        NotificationForWho.USER,
        status,
        trade.environment,
        user
      )

      transactionInstances.push(notificationInstance)
    }

    return { model: tradeInstance.model, instances: transactionInstances }
  }

  public async updateAmount(
    tradeId: ObjectId,
    stake: number,
    profit: number
  ): THttpResponse<{ trade: ITrade }> {
    try {
      const trade = await this.find(tradeId)

      trade.stake = stake
      trade.profit = profit
      trade.outcome = profit + stake
      trade.percentage = (profit * 100) / stake
      trade.investmentPercentage =
        (profit * 100) / trade.investmentObject.amount

      trade.manualUpdateAmount = true

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

  public async fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId: string
  ): THttpResponse<{ trades: ITrade[] }> {
    try {
      let trades

      if (all) {
        trades = await this.tradeModel
          .find({ environment })
          .select('-investmentObject -userObject -pair')
          .populate('investment', 'name icon')
          .populate('user', 'username isDeleted')
      } else {
        trades = await this.tradeModel
          .find({ environment, user: userId })
          .select('-investmentObject -userObject -pair')
          .populate('investment', 'name icon')
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Trade history fetched successfully',
        data: { trades },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch trade history, please try again'
      )
    }
  }
}

export default TradeService
