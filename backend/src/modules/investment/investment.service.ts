import { ITradeObject } from '@/modules/trade/trade.interface'
import { Inject, Service } from 'typedi'
import {
  IInvestment,
  IInvestmentObject,
  IInvestmentService,
} from '@/modules/investment/investment.interface'
import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { IPlanService } from '@/modules/plan/plan.interface'
import { IUserService } from '@/modules/user/user.interface'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionTitle } from '@/modules/transaction/transaction.enum'
import { IReferralService } from '@/modules/referral/referral.interface'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationTitle,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { ReferralTypes } from '@/modules/referral/referral.enum'

import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { ForecastStatus } from '../forecast/forecast.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import { BadRequestError, NotFoundError } from '@/core/apiError'
import ServiceToken from '@/core/serviceToken'
import Helpers from '@/utils/helpers'
import InvestmentModel from '@/modules/investment/investment.model'
import TradeModel from '../trade/trade.model'

@Service()
class InvestmentService implements IInvestmentService {
  private investmentModel = InvestmentModel
  private tradeModel = TradeModel

  public static dailyWaitHour = 6

  public constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @Inject(ServiceToken.REFERRAL_SERVICE)
    private referralService: IReferralService
  ) {}

  public async fetch(
    filter: FilterQuery<IInvestment>
  ): Promise<IInvestmentObject> {
    const investment = await this.investmentModel.findOne(filter)
    if (!investment) throw new NotFoundError('Investment not found')
    return investment
  }

  public async create(
    planId: ObjectId,
    userId: ObjectId,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): Promise<IInvestmentObject> {
    const plan = await this.planService.fetch({ _id: planId })

    if (!plan) throw new NotFoundError('The selected plan no longer exist')

    if (plan.minAmount > amount || plan.maxAmount < amount)
      throw new BadRequestError(
        `The amount allowed in this plan is between ${Helpers.toDollar(
          plan.minAmount
        )} and ${Helpers.toDollar(plan.maxAmount)}.`
      )

    // User Transaction Instance
    const user = await this.userService.fund(userId, account, -amount)

    // Investment Transaction Instance
    const investment = await this.investmentModel.create({
      plan,
      user,
      minRunTime:
        1000 *
        60 *
        60 *
        (plan.tradingDays * (24 + InvestmentService.dailyWaitHour)),
      gas: plan.gas,
      amount,
      balance: amount,
      account,
      environment,
      status: InvestmentStatus.AWAITING_TRADE,
      mode: plan.mode,
    })

    // Referral Transaction Instance
    if (environment === UserEnvironment.LIVE) {
      await this.referralService.create(
        ReferralTypes.INVESTMENT,
        user,
        investment.amount
      )
    }

    // Transaction Transaction Instance
    await this.transactionService.create(
      user,
      TransactionTitle.INVESTMENT_PURCHASED,
      investment,
      amount,
      environment
    )

    // Notification Transaction Instance
    await this.notificationService.create(
      `Your investment of ${Helpers.toDollar(amount)} on the ${
        plan.name
      } plan is up and running`,
      NotificationTitle.INVESTMENT_PURCHASED,
      investment,
      NotificationForWho.USER,
      environment,
      user
    )

    // Admin Notification Transaction Instance
    await this.notificationService.create(
      `${user.username} just invested in the ${
        plan.name
      } plan with the sum of ${Helpers.toDollar(
        amount
      )}, on his ${environment} account`,
      NotificationTitle.INVESTMENT_PURCHASED,
      investment,
      NotificationForWho.ADMIN,
      environment
    )

    return (await investment.populate('user')).populate('plan')
  }

  public async updateTradeDetails(
    filter: FilterQuery<IInvestment>,
    tradeObject: ITradeObject
  ): Promise<IInvestmentObject> {
    const investment = await this.investmentModel
      .findOne(filter)
      .populate('user')
      .populate('plan')

    if (!investment) throw new NotFoundError('Investment not found')

    const oldTradeStatus = investment.tradeStatus

    if (oldTradeStatus !== ForecastStatus.SETTLED) {
      investment.currentTrade = tradeObject
      investment.tradeStatus = tradeObject.status
      investment.tradeTimeStamps = tradeObject.timeStamps.slice()
      investment.tradeStartTime = tradeObject.startTime

      switch (tradeObject.status) {
        case ForecastStatus.MARKET_CLOSED:
        case ForecastStatus.ON_HOLD:
        case ForecastStatus.SETTLED:
          investment.status = InvestmentStatus.AWAITING_TRADE
          break
        case ForecastStatus.PREPARING:
          investment.status = InvestmentStatus.PROCESSING_TRADE
          break
        case ForecastStatus.RUNNING:
          investment.status = InvestmentStatus.RUNNING
          break
      }

      if (tradeObject.status === ForecastStatus.SETTLED) {
        if (!tradeObject.profit)
          throw new BadRequestError(
            'Percentage profit is required when the forecast is being settled'
          )

        investment.currentTrade = undefined
        investment.tradeStatus = undefined
        investment.tradeTimeStamps = []
        investment.tradeStartTime = undefined
        investment.runTime += tradeObject.runTime
        investment.balance += tradeObject.profit

        if (investment.runTime >= investment.minRunTime) {
          investment.status = InvestmentStatus.FINALIZING
        }
      }
    }

    await investment.save()

    return investment.populate('currentTrade')
  }

  public async updateStatus(
    filter: FilterQuery<IInvestment>,
    status: InvestmentStatus,
    sendNotice: boolean = true
  ): Promise<IInvestmentObject> {
    // Investment Transaction Instance
    const investment = await this.investmentModel
      .findOne(filter)
      .populate('user')
      .populate('plan')

    if (!investment) throw new NotFoundError('Investment not found')

    const oldStatus = investment.status

    if (oldStatus === InvestmentStatus.COMPLETED)
      throw new BadRequestError('Investment plan has already been settled')

    investment.status = status

    await investment.save()

    let user
    if (status === InvestmentStatus.COMPLETED) {
      // User Transaction Instance

      const account =
        investment.account === UserAccount.DEMO_BALANCE
          ? UserAccount.DEMO_BALANCE
          : UserAccount.MAIN_BALANCE

      user = await this.userService.fund(
        { _id: investment.user._id },
        account,
        investment.balance
      )

      // Transaction Transaction Instance
      await this.transactionService.create(
        user,
        TransactionTitle.INVESTMENT_COMPLETED,
        investment,
        investment.balance,
        investment.environment
      )

      // Referral Transaction Instance
      if (investment.environment === UserEnvironment.LIVE) {
        await this.referralService.create(
          ReferralTypes.COMPLETED_PACKAGE_EARNINGS,
          user,
          investment.balance - investment.amount
        )
      }
    }

    if (sendNotice) {
      let notificationMessage
      let notificationTitle
      switch (status) {
        case InvestmentStatus.RUNNING:
          notificationMessage = 'is now running'
          notificationTitle = NotificationTitle.INVESTMENT_RUNNING
          break
        case InvestmentStatus.SUSPENDED:
          notificationMessage = 'has been suspended'
          notificationTitle = NotificationTitle.INVESTMENT_SUSPENDED
          break
        case InvestmentStatus.COMPLETED:
          notificationMessage = 'has been completed'
          notificationTitle = NotificationTitle.INVESTMENT_COMPLETED
          break
        case InvestmentStatus.INSUFFICIENT_GAS:
          notificationMessage = 'has ran out of gas'
          notificationTitle = NotificationTitle.INVESTMENT_INSUFFICIENT_GAS
          break
        case InvestmentStatus.REFILLING:
          notificationMessage = 'is now filling'
          notificationTitle = NotificationTitle.INVESTMENT_REFILLING
          break
        case InvestmentStatus.ON_MAINTAINACE:
          notificationMessage = 'is corrently on maintance'
          notificationTitle = NotificationTitle.INVESTMENT_ON_MAINTANACE
          break
        case InvestmentStatus.AWAITING_TRADE:
          notificationMessage = 'is awaiting the trade'
          notificationTitle = NotificationTitle.INVESTMENT_AWAITING_TRADE
          break
        case InvestmentStatus.PROCESSING_TRADE:
          notificationMessage = 'is processing the next trade'
          notificationTitle = NotificationTitle.INVESTMENT_PROCESSING_TRADE
          break
      }

      // Notification Transaction Instance
      if (notificationMessage && notificationTitle) {
        user = user
          ? user
          : await this.userService.fetch({ _id: investment.user._id })

        await this.notificationService.create(
          `Your investment package ${notificationMessage}`,
          notificationTitle,
          investment,
          NotificationForWho.USER,
          investment.environment,
          user
        )
      }
    }

    return investment
  }

  public async fund(
    filter: FilterQuery<IInvestment>,
    amount: number
  ): Promise<IInvestmentObject> {
    const investment = await this.investmentModel
      .findOne(filter)
      .populate('user')
      .populate('plan')

    if (!investment) throw new NotFoundError('Investment not found')

    investment.balance += amount

    await investment.save()

    return investment
  }

  public async refill(
    filter: FilterQuery<IInvestment>,
    gas: number
  ): Promise<IInvestmentObject> {
    const investment = await this.investmentModel
      .findOne(filter)
      .populate('user')
      .populate('plan')

    if (!investment) throw new NotFoundError('Investment not found')

    investment.gas += gas

    await investment.save()

    return investment
  }

  public async delete(
    filter: FilterQuery<IInvestment>
  ): Promise<IInvestmentObject> {
    const investment = await this.investmentModel.findOne(filter)

    if (!investment) throw new NotFoundError('Investment not found')

    if (investment.status !== InvestmentStatus.COMPLETED)
      throw new BadRequestError('Investment has not been settled yet')

    await this.investmentModel.deleteOne({ _id: investment._id })
    await this.tradeModel.deleteMany({ investment: investment._id })

    return investment
  }

  public async fetchAll(
    filter: FilterQuery<IInvestment>
  ): Promise<IInvestmentObject[]> {
    return await this.investmentModel
      .find(filter)
      .populate('user')
      .populate('plan')
  }
}

export default InvestmentService
