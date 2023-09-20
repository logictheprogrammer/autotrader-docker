import { Inject, Service } from 'typedi'
import {
  ITrade,
  ITradeObject,
  ITradeService,
} from '@/modules/trade/trade.interface'
import tradeModel from '@/modules/trade/trade.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IUserObject, IUserService } from '@/modules/user/user.interface'
import {
  ITransaction,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import {
  INotification,
  INotificationService,
} from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { UserEnvironment } from '@/modules/user/user.enum'
import { THttpResponse } from '@/modules/http/http.type'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import {
  IInvestment,
  IInvestmentObject,
  IInvestmentService,
} from '../investment/investment.interface'
import { ObjectId } from 'mongoose'
import { IForecastObject } from '../forecast/forecast.interface'

@Service()
class TradeService implements ITradeService {
  private tradeModel = tradeModel

  public constructor(
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.INVESTMENT_SERVICE)
    private investmentService: IInvestmentService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
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
    forecast: IForecastObject,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number,
    environment: UserEnvironment,
    manualMode: boolean
  ): TTransaction<ITradeObject, ITrade> {
    const trade = new this.tradeModel({
      investment: investment._id,
      investmentObject: investment,
      user: user._id,
      userObject: user,
      forecast: forecast._id,
      forecastObject: forecast,
      pair: forecast.pair,
      pairObject: forecast.pairObject,
      market: forecast.market,
      stake,
      outcome,
      profit,
      percentage,
      percentageProfit: forecast.percentageProfit,
      environment,
      manualMode,
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

  public async _updateTransaction(
    investment: IInvestmentObject,
    forecast: IForecastObject,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number
  ): TTransaction<ITradeObject, ITrade> {
    const trade = await this.tradeModel.findOne({
      investment: investment._id,
      forecast: forecast._id,
    })

    if (!trade)
      throw new HttpException(
        400,
        `The trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
      )

    const oldPair = trade.pair
    const oldPairObject = trade.pairObject
    const oldMarket = trade.market
    const oldMove = trade.move
    const oldPercentageProfit = trade.percentageProfit
    const oldOpeningPrice = trade.openingPrice
    const oldClosingPrice = trade.closingPrice
    const oldStake = trade.stake
    const oldOutcome = trade.outcome
    const oldProfit = trade.profit
    const oldPercentage = trade.percentage

    trade.pair = forecast.pair._id
    trade.pairObject = forecast.pair
    trade.market = forecast.market
    trade.move = forecast.move
    trade.percentageProfit = forecast.percentageProfit
    trade.openingPrice = forecast.openingPrice
    trade.closingPrice = forecast.closingPrice
    trade.stake = stake
    trade.outcome = outcome
    trade.profit = profit
    trade.percentage = percentage

    return {
      object: trade.toObject({ getters: true }),
      instance: {
        model: trade,
        onFailed: `Set the trade with an id of (${trade._id}) to the following:
        \n pair = (${oldPair}),
        \n pairObject = (${oldPairObject}),
        \n market = (${oldMarket}),
        \n move = (${oldMove}),
        \n percentageProfit = (${oldPercentageProfit}),
        \n openingPrice = (${oldOpeningPrice}),
        \n closingPrice = (${oldClosingPrice}),
        \n stake = (${oldStake}),
        \n outcome = (${oldOutcome}),
        \n profit = (${oldProfit}),
        \n percentage = (${oldPercentage}),
        `,
        callback: async () => {
          trade.pair = oldPair
          trade.pairObject = oldPairObject
          trade.market = oldMarket
          trade.move = oldMove
          trade.percentageProfit = oldPercentageProfit
          trade.openingPrice = oldOpeningPrice
          trade.closingPrice = oldClosingPrice
          trade.stake = oldStake
          trade.outcome = oldOutcome
          trade.profit = oldProfit
          trade.percentage = oldPercentage

          await trade.save()
        },
      },
    }
  }

  public async _updateStatusTransaction(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): TTransaction<ITradeObject, ITrade> {
    const trade = await this.tradeModel.findOne({
      investment: investment._id,
      forecast: forecast._id,
    })

    if (!trade)
      throw new HttpException(
        400,
        `The trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
      )

    const oldStatus = trade.status
    const oldStartTime = trade.startTime
    const oldTimeStamps = trade.timeStamps.slice()
    const oldRuntime = trade.runTime
    const oldMove = trade.move

    if (oldStatus === ForecastStatus.SETTLED)
      throw new HttpException(400, 'This trade has already been settled')

    trade.status = forecast.status
    trade.startTime = forecast.startTime
    trade.timeStamps = forecast.timeStamps.slice()
    trade.runTime = forecast.runTime
    trade.move = forecast.move

    return {
      object: trade.toObject({ getters: true }),
      instance: {
        model: trade,
        onFailed: `Set the status of the trade with an id of (${
          trade._id
        }) to (${oldStatus}) and startTime to (${oldStartTime}) and timeStamps to (${JSON.stringify(
          oldTimeStamps
        )}) and move to (${oldMove}) and runtime to (${oldRuntime})`,
        callback: async () => {
          trade.status = oldStatus
          trade.startTime = oldStartTime
          trade.timeStamps = oldTimeStamps
          trade.move = oldMove
          trade.runTime = oldRuntime
          await trade.save()
        },
      },
    }
  }

  public async create(
    userId: ObjectId,
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<
    ITransactionInstance<ITransaction | INotification | ITrade | IInvestment>[]
  > {
    const transactionInstances: ITransactionInstance<
      ITransaction | INotification | ITrade | IInvestment
    >[] = []

    const userObject = await this.userService.get(userId)

    const amount = investment.amount
    const stake = forecast.stakeRate * amount
    const profit = (forecast.percentageProfit / 100) * amount
    const outcome = stake + profit
    const percentage = (profit * 100) / stake

    // Trade Transaction Instance
    const { instance: tradeTransactionInstance, object: tradeObject } =
      await this._createTransaction(
        userObject,
        investment,
        forecast,
        stake,
        outcome,
        profit,
        percentage,
        investment.environment,
        investment.manualMode
      )
    transactionInstances.push(tradeTransactionInstance)

    // Investment Transaction Instance
    const investmentTransactionInstance =
      await this.investmentService.updateTradeDetails(
        tradeObject.investment,
        tradeObject
      )
    transactionInstances.push(investmentTransactionInstance)

    // Transaction Transaction Instance
    const transactionInstance = await this.transactionService.create(
      userObject,
      tradeObject.status,
      TransactionCategory.TRADE,
      tradeObject,
      stake,
      tradeObject.environment,
      stake
    )
    transactionInstances.push(transactionInstance)

    // Notification Transaction Instance
    const userNotificationInstance = await this.notificationService.create(
      `Your ${tradeObject.investmentObject.planObject.name} investment plan now has a pending trade to be placed`,
      NotificationCategory.TRADE,
      tradeObject,
      NotificationForWho.USER,
      tradeObject.status,
      tradeObject.environment,
      userObject
    )
    transactionInstances.push(userNotificationInstance)

    return transactionInstances
  }

  public async update(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITransactionInstance<ITrade | IInvestment>[]> {
    const transactionInstances: ITransactionInstance<ITrade | IInvestment>[] =
      []

    const amount = investment.amount
    const stake = forecast.stakeRate * amount
    const profit = (forecast.percentageProfit / 100) * amount
    const outcome = stake + profit
    const percentage = (profit * 100) / stake

    // Trade Transaction Instance
    const { instance: tradeTransactionInstance, object: tradeObject } =
      await this._updateTransaction(
        investment,
        forecast,
        stake,
        outcome,
        profit,
        percentage
      )
    transactionInstances.push(tradeTransactionInstance)

    // Investment Transaction Instance
    const investmentTransactionInstance =
      await this.investmentService.updateTradeDetails(
        tradeObject.investment,
        tradeObject
      )
    transactionInstances.push(investmentTransactionInstance)

    return transactionInstances
  }

  public async updateStatus(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<
    ITransactionInstance<ITransaction | INotification | ITrade | IInvestment>[]
  > {
    const transactionInstances: ITransactionInstance<
      ITransaction | INotification | ITrade | IInvestment
    >[] = []

    // Trade Transaction Instance
    const { object: tradeObject, instance: tradeInstance } =
      await this._updateStatusTransaction(investment, forecast)
    transactionInstances.push(tradeInstance)

    const user = await this.userService.get(tradeObject.user)

    // Investment Transaction Instance
    const investmentTransactionInstance =
      await this.investmentService.updateTradeDetails(
        tradeObject.investment,
        tradeObject
      )
    transactionInstances.push(investmentTransactionInstance)

    // Transaction Transaction Instance
    if (tradeObject.status === ForecastStatus.SETTLED) {
      const transactionInstance = await this.transactionService.updateAmount(
        tradeObject._id,
        tradeObject.status,
        tradeObject.outcome
      )
      transactionInstances.push(transactionInstance)
    }

    // Notification Transaction Instance
    let notificationMessage
    switch (tradeObject.status) {
      case ForecastStatus.RUNNING:
        notificationMessage = 'is now running'
        break
      case ForecastStatus.MARKET_CLOSED:
        notificationMessage = 'market has closed'
        break
      case ForecastStatus.ON_HOLD:
        notificationMessage = 'is currently on hold'
        break
      case ForecastStatus.SETTLED:
        notificationMessage = 'has been settled'
        break
    }
    if (notificationMessage) {
      const notificationInstance = await this.notificationService.create(
        `Your ${tradeObject.investmentObject.planObject.name} investment plan current trade ${notificationMessage}`,
        NotificationCategory.TRADE,
        tradeObject,
        NotificationForWho.USER,
        tradeObject.status,
        tradeObject.environment,
        user
      )
      transactionInstances.push(notificationInstance)
    }

    return transactionInstances
  }

  public async delete(tradeId: ObjectId): THttpResponse<{ trade: ITrade }> {
    try {
      const trade = await this.find(tradeId)

      if (trade.status !== ForecastStatus.SETTLED)
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
