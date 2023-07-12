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
import {
  ITransaction,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import {
  IReferral,
  IReferralService,
} from '@/modules/referral/referral.interface'
import {
  INotification,
  INotificationService,
} from '@/modules/notification/notification.interface'
import formatNumber from '@/utils/formats/formatNumber'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { ReferralTypes } from '@/modules/referral/referral.enum'
import {
  ITransactionInstance,
  ITransactionManagerService,
} from '@/modules/transactionManager/transactionManager.interface'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { THttpResponse } from '@/modules/http/http.type'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import ServiceQuery from '@/modules/service/service.query'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { Types } from 'mongoose'
import { IInvestmentObject } from '../investment/investment.interface'
import { IPairObject, IPairService } from '../pair/pair.interface'
import Helpers from '@/utils/helpers/helpers'
import { IMathService } from '../math/math.interface'
import { InvestmentStatus } from '../investment/investment.enum'
import { TUpdateTradeStatus } from './trade.type'

@Service()
class TradeService implements ITradeService {
  private tradeModel = new ServiceQuery<ITrade>(tradeModel)

  public static minStakeRate = 0.1
  public static maxStakeRate = 0.25
  public static profitBreakpoint = 3
  public static profitProbability = 0.5
  public static dailTrades = 24

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
    tradeId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<ITrade> {
    const trade = await this.tradeModel.findById(
      tradeId,
      fromAllAccounts,
      userId
    )

    if (!trade) throw new HttpException(404, 'Trade not found')

    return trade
  }

  public async _createTransaction(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    move: TradeMove,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number,
    investmentPercentage: number,
    environment: UserEnvironment,
    manualMode: boolean = false
  ): TTransaction<ITradeObject, ITrade> {
    const trade = new this.tradeModel.self({
      investment: investment._id,
      investmentObject: investment,
      user: user._id,
      userObject: user,
      pair: pair._id,
      pairObject: pair,
      market: pair.assetType,
      move,
      stake,
      outcome,
      profit,
      percentage,
      investmentPercentage,
      environment,
      manualMode,
    })

    return {
      object: trade.toObject(),
      instance: {
        model: trade,
        onFailed: `Delete the trade with an id of (${trade._id})`,
        async callback() {
          await trade.deleteOne()
        },
      },
    }
  }

  public async _updateStatusTransaction(
    tradeId: Types.ObjectId,
    status: TradeStatus,
    price?: number
  ): TTransaction<ITradeObject, ITrade> {
    const trade = await this.find(tradeId)

    const oldStatus = trade.status

    if (oldStatus === TradeStatus.SETTLED)
      throw new HttpException(400, 'This trade has already been settled')

    switch (status) {
      case TradeStatus.START:
        if (price === undefined) throw new Error('Price is required')
        trade.status = TradeStatus.RUNNING
        trade.startTime = new Date()
        trade.openingPrice = price
        break

      case TradeStatus.ACTIVE:
        trade.status = TradeStatus.RUNNING
        break

      case TradeStatus.SETTLED:
        if (price === undefined) throw new Error('Price is required')
        trade.stopTime = new Date()
        trade.closingPrice = price

      default:
        trade.status = status
        break
    }

    return {
      object: trade.toObject(),
      instance: {
        model: trade,
        onFailed: `Set the status of the trade with an id of (${trade._id}) to (${oldStatus})`,
        async callback() {
          trade.status = oldStatus
          await trade.save()
        },
      },
    }
  }

  public async create(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    move: TradeMove,
    stakeRate: number,
    investmentPercentage: number
  ): Promise<ITransactionInstance<ITrade>> {
    const amount = investment.amount
    const environment = investment.environment
    // const assets = investment.assets
    // const minProfit = investment.minProfit / 24
    // const maxProfit = investment.maxProfit / 24

    // const baseAsset = Helpers.randomPickFromArray<Types.ObjectId>(assets)

    // const pairs = await this.pairService.getByBase(baseAsset)

    // if (!pairs.length) throw new Error('Pairs of the base asset was not found')

    // const pair = Helpers.randomPickFromArray<IPairObject>(pairs)

    // const move = Helpers.randomPickFromArray<TradeMove>(
    //   Object.values(TradeMove)
    // )

    // const stakeRate = Helpers.getRandomValue(TradeService.minStakeRate,TradeService.maxStakeRate)
    const stake = stakeRate * amount

    // const spread = stakeRate * minProfit

    // const investmentPercentage = this.mathService.dynamicRange(
    //   minProfit,
    //   maxProfit,
    //   spread,
    //   spread * 3,
    //   0.5
    // )

    const profit = (investmentPercentage / 100) * amount

    const outcome = stake + profit

    const percentage = (profit * 100) / stake

    return (
      await this._createTransaction(
        user,
        investment,
        pair,
        move,
        stake,
        outcome,
        profit,
        percentage,
        investmentPercentage,
        environment
      )
    ).instance
  }

  public async createManual(
    investmentId: Types.ObjectId,
    pairId: Types.ObjectId
  ): THttpResponse<{ trade: ITrade }> {
    try {
      const investment = await this.investmentService.get(investmentId)
      const pair = await this.pairService.get(pairId)
      const user = await this.userService.get(investment.user)

      if (!pair)
        throw new HttpException(404, 'The selected pair no longer exist')

      if (pair.assetType !== investment.assetType)
        throw new HttpException(
          400,
          'The pair is not compatible with this investment plan'
        )

      const amount = investment.amount
      const environment = investment.environment
      const minProfit = investment.minProfit / TradeService.dailTrades
      const maxProfit = investment.maxProfit / TradeService.dailTrades

      const move = Helpers.randomPickFromArray<TradeMove>(
        Object.values(TradeMove)
      )

      const stakeRate = Helpers.getRandomValue(
        TradeService.minStakeRate,
        TradeService.maxStakeRate
      )
      const stake = stakeRate * amount

      const spread = stakeRate * minProfit

      const breakpoint = spread * TradeService.profitBreakpoint

      const investmentPercentage = this.mathService.dynamicRange(
        minProfit,
        maxProfit,
        spread,
        breakpoint,
        TradeService.profitProbability
      )

      const profit = (investmentPercentage / 100) * amount

      const outcome = stake + profit

      const percentage = (profit * 100) / stake

      const { model: trade } = (
        await this._createTransaction(
          user,
          investment,
          pair,
          move,
          stake,
          outcome,
          profit,
          percentage,
          investmentPercentage,
          environment,
          true
        )
      ).instance

      await trade.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Trade created successfully',
        data: { trade },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to create this trade, please try again'
      )
    }
  }

  public async updateManual(
    tradeId: Types.ObjectId,
    pairId: Types.ObjectId,
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
      trade.stopTime = stopTime ?? trade.stopTime

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
      throw new ServiceException(
        err,
        'Failed to update this trade, please try again'
      )
    }
  }

  public async updateStatus(
    tradeId: Types.ObjectId,
    status: TradeStatus,
    price?: number
  ): Promise<{ model: ITrade; instances: TUpdateTradeStatus }> {
    const transactionInstances: TUpdateTradeStatus = []

    const { object: trade, instance: tradeInstance } =
      await this._updateStatusTransaction(tradeId, status, price)

    transactionInstances.push(tradeInstance)

    const user = await this.userService.get(trade.user)

    switch (status) {
      case TradeStatus.START:
        const transactionInstance1 = await this.transactionService.create(
          user,
          TradeStatus.ACTIVE,
          TransactionCategory.TRADE,
          trade,
          trade.stake,
          trade.environment,
          trade.stake
        )
        transactionInstances.push(transactionInstance1)
        break

      case TradeStatus.MARKET_OPENED:
        ;(
          await this.investmentService.updateStatus(
            trade.investment,
            InvestmentStatus.MARKET_OPENED,
            true
          )
        ).instances.forEach((instance) => {
          transactionInstances.push(instance)
        })
        break

      case TradeStatus.RUNNING:
        ;(
          await this.investmentService.updateStatus(
            trade.investment,
            InvestmentStatus.RUNNING,
            false
          )
        ).instances.forEach((instance) => {
          transactionInstances.push(instance)
        })

        break

      case TradeStatus.ON_HOLD:
        ;(
          await this.investmentService.updateStatus(
            trade.investment,
            InvestmentStatus.TRADE_ON_HOLD,
            false
          )
        ).instances.forEach((instance) => {
          transactionInstances.push(instance)
        })
        break

      case TradeStatus.MARKET_CLOSED:
        ;(
          await this.investmentService.updateStatus(
            trade.investment,
            InvestmentStatus.MARKET_CLOSED,
            true
          )
        ).instances.forEach((instance) => {
          transactionInstances.push(instance)
        })

        break

      case TradeStatus.SETTLED:
        const { instance: investmentInstance } =
          await this.investmentService.fund(trade.investment, trade.outcome)
        transactionInstances.push(investmentInstance)

        const transactionInstance = await this.transactionService.updateAmount(
          trade._id,
          status,
          trade.outcome
        )
        transactionInstances.push(transactionInstance)
        break
    }

    let notificationMessage
    switch (status) {
      case TradeStatus.RUNNING:
        notificationMessage = 'is now ' + status
        break
      case TradeStatus.START:
        notificationMessage = 'just kick started'
        break
      case TradeStatus.ON_HOLD:
        notificationMessage = 'is currently ' + status
        break
      case TradeStatus.SETTLED:
        notificationMessage = 'has been ' + status
        break
    }

    if (notificationMessage) {
      const notificationInstance = await this.notificationService.create(
        `Your investment trade ${notificationMessage}`,
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

  public async forceUpdateStatus(
    tradeId: Types.ObjectId,
    status: TradeStatus
  ): THttpResponse<{ trade: ITrade }> {
    try {
      const tradeExist = await this.find(tradeId)

      if (status === TradeStatus.WAITING)
        throw new HttpException(400, 'Status not allowed')

      if (!tradeExist.manualMode) {
        switch (status) {
          case TradeStatus.PREPARING:
          case TradeStatus.START:
          case TradeStatus.ACTIVE:
          case TradeStatus.MARKET_CLOSED:
          case TradeStatus.MARKET_OPENED:
          case TradeStatus.SETTLED:
            throw new HttpException(400, 'Status not allowed')
        }
      }

      const { model: trade, instances: transactionInstances } =
        await this.updateStatus(tradeId, status)

      await this.transactionManagerService.execute(transactionInstances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Status updated successfully',
        data: { trade },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to update this trade  status, please try again'
      )
    }
  }

  public async updateAmount(
    tradeId: Types.ObjectId,
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
      throw new ServiceException(
        err,
        'Failed to update this trade, please try again'
      )
    }
  }

  public async delete(
    tradeId: Types.ObjectId
  ): THttpResponse<{ trade: ITrade }> {
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
      throw new ServiceException(
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
      const trades = await this.tradeModel
        .find({ environment }, all, {
          user: userId,
        })
        .select('-investmentObject -userObject -pair')

      await this.tradeModel.populate(
        trades,
        'investment',
        'investmentObject',
        'name icon'
      )

      await this.tradeModel.populate(
        trades,
        'user',
        'userObject',
        'username isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Trade history fetched successfully',
        data: { trades },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch trade history, please try again'
      )
    }
  }
}

export default TradeService
