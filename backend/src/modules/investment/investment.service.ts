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
import { FilterQuery, ObjectId } from 'mongoose'
import { BadRequestError, NotFoundError } from '@/core/apiError'
import ServiceToken from '@/core/serviceToken'
import Helpers from '@/utils/helpers'
import InvestmentModel from '@/modules/investment/investment.model'

@Service()
class InvestmentService implements IInvestmentService {
  private investmentModel = InvestmentModel
  private autoRunTimes = 0

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
      expectedRunTime: 1000 * 60 * 60 * 24 * plan.duration,
      amount,
      balance: amount,
      account,
      environment,
      status: InvestmentStatus.RUNNING,
      resumeTime: new Date(),
      assetType: plan.assetType,
      assets: plan.assets,
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

    return (
      await (await investment.populate('user')).populate('assets')
    ).populate('plan')
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
      .populate('assets')

    if (!investment) throw new NotFoundError('Investment not found')

    investment.status = status

    let user
    if (status === InvestmentStatus.COMPLETED) {
      // User Transaction Instance

      const balance =
        ((investment.plan?.potentialPercentageProfit || 100) *
          investment.amount) /
          100 +
        (investment.amount + investment.extraProfit)

      investment.balance = balance

      const account =
        investment.account === UserAccount.DEMO_BALANCE
          ? UserAccount.DEMO_BALANCE
          : UserAccount.PROFIT

      user = await this.userService.fund(
        { _id: investment.user._id },
        account,
        balance
      )

      // Transaction Transaction Instance
      await this.transactionService.create(
        user,
        TransactionTitle.INVESTMENT_COMPLETED,
        investment,
        balance,
        investment.environment
      )

      // Referral Transaction Instance
      if (investment.environment === UserEnvironment.LIVE) {
        await this.referralService.create(
          ReferralTypes.COMPLETED_PACKAGE_EARNINGS,
          user,
          balance - investment.amount
        )
      }
    } else if (status === InvestmentStatus.SUSPENDED) {
      const runTime = new Date().getTime() - investment.resumeTime.getTime()
      investment.runTime += runTime
      investment.resumeTime = new Date()
    } else if (status === InvestmentStatus.RUNNING) {
      investment.resumeTime = new Date()
    }

    await investment.save()

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
      .populate('assets')

    if (!investment) throw new NotFoundError('Investment not found')

    investment.extraProfit += amount

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

    return investment
  }

  public async fetchAll(
    filter: FilterQuery<IInvestment>
  ): Promise<IInvestmentObject[]> {
    return await this.investmentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('plan')
      .populate('assets')
  }

  public async autoRun(miniSeconds: number): Promise<void> {
    setTimeout(async () => {
      this.autoRunTimes++
      console.log('Investment Auto Run Started...', this.autoRunTimes)
      const investments = await this.investmentModel.find({
        status: InvestmentStatus.RUNNING,
      })

      for (const investment of investments) {
        const runTime =
          investment.runTime +
          (new Date().getTime() - new Date(investment.resumeTime).getTime())

        const timeRemaining = investment.expectedRunTime - runTime

        if (timeRemaining <= 0) {
          await this.updateStatus(
            { _id: investment._id },
            InvestmentStatus.COMPLETED
          )

          console.log(
            `Investment ${investment._id} has been completed automatically`
          )
        } else {
          const daysLeft = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
          const hoursLeft = Math.floor(
            (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          )
          const minutesLeft = Math.floor(
            (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
          )
          const secondsLeft = Math.floor((timeRemaining % (1000 * 60)) / 1000)

          console.log(
            `Investment ${investment._id} has ${daysLeft} days, ${hoursLeft} hours, ${minutesLeft} minutes, ${secondsLeft} seconds left`
          )
        }
      }
      this.autoRun(miniSeconds)
      console.log('Investment Auto Run Finished...', this.autoRunTimes)
    }, miniSeconds)
  }

  public async count(filter: FilterQuery<IInvestment>): Promise<number> {
    return await this.investmentModel.count(filter)
  }
}

export default InvestmentService
