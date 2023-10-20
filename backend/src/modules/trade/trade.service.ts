import { Inject, Service } from 'typedi'
import {
  ITrade,
  ITradeObject,
  ITradeService,
} from '@/modules/trade/trade.interface'
import tradeModel from '@/modules/trade/trade.model'
import { ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IUserService } from '@/modules/user/user.interface'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import {
  IInvestmentObject,
  IInvestmentService,
} from '../investment/investment.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import { IForecastObject } from '../forecast/forecast.interface'
import { BadRequestError, NotFoundError, ServiceError } from '@/core/apiError'
import ServiceToken from '@/core/serviceToken'

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

  public async create(
    userId: ObjectId,
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject> {
    const user = await this.userService.fetch({ _id: userId })

    const amount = investment.amount
    const stake = forecast.stakeRate * amount
    const profit = (forecast.percentageProfit / 100) * amount
    const outcome = stake + profit
    const percentage = (profit * 100) / stake

    // Trade Transaction Instance

    const trade = await this.tradeModel.create({
      investment,
      user,
      forecast,
      pair: forecast.pair,
      market: forecast.market,
      stake,
      outcome,
      profit,
      percentage,
      percentageProfit: forecast.percentageProfit,
      environment: investment.environment,
      manualMode: investment.manualMode,
    })

    // Investment Transaction Instance

    await this.investmentService.updateTradeDetails(trade.investment._id, trade)

    // Transaction Transaction Instance
    await this.transactionService.create(
      user,
      trade.status,
      TransactionCategory.TRADE,
      trade,
      stake,
      trade.environment,
      stake
    )

    // Notification Transaction Instance
    await this.notificationService.create(
      `Your ${trade.investment.plan.name} investment plan now has a pending trade to be placed`,
      NotificationCategory.TRADE,
      trade,
      NotificationForWho.USER,
      trade.status,
      trade.environment,
      user
    )

    return trade
  }

  public async update(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject> {
    const amount = investment.amount
    const stake = forecast.stakeRate * amount
    const profit = (forecast.percentageProfit / 100) * amount
    const outcome = stake + profit
    const percentage = (profit * 100) / stake

    const trade = await this.tradeModel.findOne({
      investment: investment._id,
      forecast: forecast._id,
    })

    if (!trade)
      throw new NotFoundError(
        `The trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
      )

    trade.pair = forecast.pair
    trade.market = forecast.market
    trade.move = forecast.move
    trade.percentageProfit = forecast.percentageProfit
    trade.openingPrice = forecast.openingPrice
    trade.closingPrice = forecast.closingPrice
    trade.stake = stake
    trade.outcome = outcome
    trade.profit = profit
    trade.percentage = percentage

    await trade.save()

    await this.investmentService.updateTradeDetails(trade.investment._id, trade)

    return trade
  }

  public async updateStatus(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject> {
    const trade = await this.tradeModel.findOne({
      investment: investment._id,
      forecast: forecast._id,
    })

    if (!trade)
      throw new NotFoundError(
        `The trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
      )

    const oldStatus = trade.status

    if (oldStatus === ForecastStatus.SETTLED)
      throw new BadRequestError('This trade has already been settled')

    trade.status = forecast.status
    trade.startTime = forecast.startTime
    trade.timeStamps = forecast.timeStamps.slice()
    trade.runTime = forecast.runTime
    trade.move = forecast.move

    await trade.save()

    const user = await this.userService.fetch({ _id: trade.user._id })

    // Investment Transaction Instance
    await this.investmentService.updateTradeDetails(trade.investment._id, trade)

    // Transaction Transaction Instance
    await this.transactionService.updateAmount(
      trade._id,
      trade.status,
      trade.outcome
    )

    // Notification Transaction Instance
    let notificationMessage
    switch (trade.status) {
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
      await this.notificationService.create(
        `Your ${trade.investment.plan.name} investment plan current trade ${notificationMessage}`,
        NotificationCategory.TRADE,
        trade,
        NotificationForWho.USER,
        trade.status,
        trade.environment,
        user
      )
    }

    return trade
  }

  public async delete(filter: FilterQuery<ITrade>): Promise<ITradeObject> {
    try {
      const trade = await this.tradeModel.findOne(filter)

      if (!trade) throw new NotFoundError('Trade not found')

      if (trade.status !== ForecastStatus.SETTLED)
        throw new BadRequestError('Trade has not been settled yet')

      await trade.deleteOne()
      return trade
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete this trade, please try again'
      )
    }
  }

  public async fetchAll(filter: FilterQuery<ITrade>): Promise<ITradeObject[]> {
    try {
      return await this.tradeModel
        .find(filter)
        .populate('investment', 'name icon')
        .populate('user', 'username ')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch trade history, please try again'
      )
    }
  }
}

export default TradeService
