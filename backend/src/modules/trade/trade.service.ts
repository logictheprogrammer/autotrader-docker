import { Inject, Service } from 'typedi'
import {
  ITrade,
  ITradeObject,
  ITradeService,
} from '@/modules/trade/trade.interface'
import { ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IUserService } from '@/modules/user/user.interface'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionTitle } from '@/modules/transaction/transaction.enum'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationTitle,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import {
  IInvestmentObject,
  IInvestmentService,
} from '../investment/investment.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import { IForecastObject } from '../forecast/forecast.interface'
import { BadRequestError, NotFoundError } from '@/core/apiError'
import ServiceToken from '@/core/serviceToken'
import TradeModel from '@/modules/trade/trade.model'

@Service()
class TradeService implements ITradeService {
  private tradeModel = TradeModel

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
    const profit = forecast.percentageProfit
      ? forecast.percentageProfit * amount
      : undefined
    const outcome = profit ? stake + profit : undefined
    const percentage = profit ? profit / stake : undefined

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
      status: forecast.status,
      percentageProfit: forecast.percentageProfit,
      environment: investment.environment,
      mode: forecast.mode,
    })

    // Investment Transaction Instance

    await this.investmentService.updateTradeDetails(
      { _id: trade.investment._id },
      trade
    )

    // Transaction Transaction Instance
    await this.transactionService.create(
      user,
      TransactionTitle.TRADE_STAKE,
      trade,
      stake,
      trade.environment
    )

    // Notification Transaction Instance
    await this.notificationService.create(
      `Your ${trade.investment.plan.name} investment plan now has a pending trade to be placed`,
      NotificationTitle.TRADE_STAKE,
      trade,
      NotificationForWho.USER,
      trade.environment,
      user
    )

    return (await trade.populate('user')).populate('investment')
  }

  public async update(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject> {
    const amount = investment.amount
    const stake = forecast.stakeRate * amount
    const profit = forecast.percentageProfit
      ? forecast.percentageProfit * amount
      : undefined
    const outcome = profit ? stake + profit : undefined
    const percentage = profit ? profit / stake : undefined

    const trade = await this.tradeModel.findOne({
      investment: investment._id,
      forecast: forecast._id,
      mode: forecast.mode,
    })

    if (!trade)
      throw new NotFoundError(
        `The (${forecast.mode}) trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
      )

    trade.status = forecast.status
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

    const tradeInvestmentCount = await this.investmentService.count({
      _id: trade.investment._id,
      currentTrade: trade._id,
    })

    if (tradeInvestmentCount) {
      await this.investmentService.updateTradeDetails(
        { _id: trade.investment._id, currentTrade: trade._id },
        trade
      )
    }

    return (
      await (await trade.populate('user')).populate('investment')
    ).populate('forecast')
  }

  public async updateStatus(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject> {
    const trade = await this.tradeModel
      .findOne({
        investment: investment._id,
        forecast: forecast._id,
        mode: forecast.mode,
      })
      .populate('user')
      .populate('investment')
      .populate('forecast')

    if (!trade)
      throw new NotFoundError(
        `The (${forecast.mode}) trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
      )

    if (
      forecast.status === ForecastStatus.SETTLED &&
      !forecast.percentageProfit
    )
      throw new BadRequestError(
        'Percentage profit is required when the forecast is being settled'
      )

    const amount = investment.amount
    const stake = forecast.stakeRate * amount
    const profit = forecast.percentageProfit
      ? forecast.percentageProfit * amount
      : undefined
    const outcome = profit ? stake + profit : undefined
    const percentage = profit ? profit / stake : undefined

    const oldStatus = trade.status

    if (oldStatus === ForecastStatus.SETTLED)
      throw new BadRequestError('This trade has already been settled')

    trade.stake = stake
    trade.outcome = outcome
    trade.profit = profit
    trade.percentage = percentage
    trade.status = forecast.status
    trade.startTime = forecast.startTime
    trade.timeStamps = forecast.timeStamps.slice()
    trade.runTime = forecast.runTime
    trade.move = forecast.move

    await trade.save()

    const user = await this.userService.fetch({ _id: trade.user._id })

    const tradeInvestmentCount = await this.investmentService.count({
      _id: trade.investment._id,
      currentTrade: trade._id,
    })

    if (tradeInvestmentCount) {
      await this.investmentService.updateTradeDetails(
        { _id: trade.investment._id, currentTrade: trade._id },
        trade
      )
    }

    if (trade.status === ForecastStatus.SETTLED) {
      await this.transactionService.create(
        user,
        TransactionTitle.TRADE_SETTLED,
        trade,
        outcome!,
        trade.environment
      )
    }

    // Notification Transaction Instance
    let notificationMessage
    let notificationTitle
    switch (trade.status) {
      case ForecastStatus.RUNNING:
        notificationMessage = 'is now running'
        notificationTitle = NotificationTitle.TRADE_RUNNING
        break
      case ForecastStatus.MARKET_CLOSED:
        notificationMessage = 'market has closed'
        notificationTitle = NotificationTitle.TRADE_MARKET_CLOSED
        break
      case ForecastStatus.ON_HOLD:
        notificationMessage = 'is currently on hold'
        notificationTitle = NotificationTitle.TRADE_ON_HOLD
        break
      case ForecastStatus.SETTLED:
        notificationMessage = 'has been settled'
        notificationTitle = NotificationTitle.TRADE_SETTLED
        break
    }
    if (notificationMessage && notificationTitle) {
      await this.notificationService.create(
        `Your ${trade.investment.plan.name} investment plan current trade ${notificationMessage}`,
        notificationTitle,
        trade,
        NotificationForWho.USER,
        trade.environment,
        user
      )
    }

    return trade
  }

  public async delete(filter: FilterQuery<ITrade>): Promise<ITradeObject> {
    const trade = await this.tradeModel.findOne(filter)

    if (!trade) throw new NotFoundError('Trade not found')

    await trade.deleteOne()

    const tradeInvestmentCount = await this.investmentService.count({
      _id: trade.investment,
      currentTrade: trade._id,
    })

    console.log('Count here:', tradeInvestmentCount)

    if (tradeInvestmentCount)
      this.investmentService.updateTradeDetails(
        { _id: trade.investment, currentTrade: trade._id },
        null
      )

    return trade
  }

  public async fetchAll(filter: FilterQuery<ITrade>): Promise<ITradeObject[]> {
    return await this.tradeModel
      .find(filter)
      .populate('user')
      .populate('investment')
  }
}

export default TradeService
