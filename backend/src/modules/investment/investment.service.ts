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
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IReferralService } from '@/modules/referral/referral.interface'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { ReferralTypes } from '@/modules/referral/referral.enum'

import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { ForecastStatus } from '../forecast/forecast.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import { IMathService } from '../math/math.interface'
import { BadRequestError, NotFoundError, ServiceError } from '@/core/apiError'
import ServiceToken from '@/core/serviceToken'
import Helpers from '@/utils/helpers'
import InvestmentModel from '@/modules/investment/investment.model'
import TradeModel from '../trade/trade.model'

@Service()
class InvestmentService implements IInvestmentService {
  private investmentModel = InvestmentModel
  private tradeModel = TradeModel

  public static minWaitHour = 4
  public static maxWaitHour = 8

  public constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @Inject(ServiceToken.REFERRAL_SERVICE)
    private referralService: IReferralService,
    @Inject(ServiceToken.MATH_SERVICE)
    private mathService: IMathService
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
    try {
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
          plan.duration *
          1000 *
          60 *
          60 *
          (24 -
            this.mathService.probabilityValue(
              InvestmentService.minWaitHour,
              InvestmentService.maxWaitHour,
              0.76
            )),
        gas: plan.gas,
        amount,
        balance: amount,
        account,
        environment,
        status: InvestmentStatus.AWAITING_TRADE,
        manualMode: plan.manualMode,
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
        investment.status,
        TransactionCategory.INVESTMENT,
        investment,
        amount,
        environment,
        amount
      )

      // Notification Transaction Instance
      await this.notificationService.create(
        `Your investment of ${Helpers.toDollar(amount)} on the ${
          plan.name
        } plan is up and running`,
        NotificationCategory.INVESTMENT,
        investment,
        NotificationForWho.USER,
        investment.status,
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
        NotificationCategory.INVESTMENT,
        investment,
        NotificationForWho.ADMIN,
        investment.status,
        environment
      )

      return (await investment.populate('user')).populate('plan')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to register this investment, please try again'
      )
    }
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

    investment.currentTrade = tradeObject._id
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
      default:
        throw new BadRequestError('Invalid forcast status')
    }

    if (tradeObject.status === ForecastStatus.SETTLED) {
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

    await investment.save()

    return investment
  }

  public async updateStatus(
    filter: FilterQuery<IInvestment>,
    status: InvestmentStatus,
    sendNotice: boolean = true
  ): Promise<IInvestmentObject> {
    try {
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
          investment.user._id,
          account,
          investment.balance
        )

        // Transaction Transaction Instance
        await this.transactionService.updateAmount(
          investment._id,
          investment.status,
          investment.balance
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
        switch (status) {
          case InvestmentStatus.RUNNING:
            notificationMessage = 'is now running'
            break
          case InvestmentStatus.SUSPENDED:
            notificationMessage = 'has been suspended'
            break
          case InvestmentStatus.COMPLETED:
            notificationMessage = 'has been completed'
            break
          case InvestmentStatus.INSUFFICIENT_GAS:
            notificationMessage = 'has ran out of gas'
            break
          case InvestmentStatus.REFILLING:
            notificationMessage = 'is now filling'
            break
          case InvestmentStatus.ON_MAINTAINACE:
            notificationMessage = 'is corrently on maintance'
            break
          case InvestmentStatus.AWAITING_TRADE:
            notificationMessage = 'is awaiting the trade'
            break
          case InvestmentStatus.PROCESSING_TRADE:
            notificationMessage = 'is processing the next trade'
            break
        }

        // Notification Transaction Instance
        if (notificationMessage) {
          const receiver = user
            ? user
            : await this.userService.fetch({ _id: investment.user._id })

          await this.notificationService.create(
            `Your investment package ${notificationMessage}`,
            NotificationCategory.INVESTMENT,
            investment,
            NotificationForWho.USER,
            status,
            investment.environment,
            receiver
          )
        }
      }

      return investment
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update this investment  status, please try again'
      )
    }
  }

  public async fund(
    filter: FilterQuery<IInvestment>,
    amount: number
  ): Promise<IInvestmentObject> {
    try {
      const investment = await this.investmentModel
        .findOne(filter)
        .populate('user')
        .populate('plan')

      if (!investment) throw new NotFoundError('Investment not found')

      investment.balance += amount

      await investment.save()

      return investment
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fund this investment, please try again'
      )
    }
  }

  public async refill(
    filter: FilterQuery<IInvestment>,
    gas: number
  ): Promise<IInvestmentObject> {
    try {
      const investment = await this.investmentModel
        .findOne(filter)
        .populate('user')
        .populate('plan')

      if (!investment) throw new NotFoundError('Investment not found')

      investment.gas += gas

      await investment.save()

      return investment
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to refill this investment, please try again'
      )
    }
  }

  public async delete(
    filter: FilterQuery<IInvestment>
  ): Promise<IInvestmentObject> {
    try {
      const investment = await this.investmentModel.findOne(filter)

      if (!investment) throw new NotFoundError('Investment not found')

      if (investment.status !== InvestmentStatus.COMPLETED)
        throw new BadRequestError('Investment has not been settled yet')

      await this.investmentModel.deleteOne({ _id: investment._id })
      await this.tradeModel.deleteMany({ investment: investment._id })

      return investment
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete this investment, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<IInvestment>
  ): Promise<IInvestmentObject[]> {
    try {
      const investments = await this.investmentModel
        .find(filter)
        .populate('user')
        .populate('plan')

      return investments
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch investment history, please try again'
      )
    }
  }
}

export default InvestmentService
