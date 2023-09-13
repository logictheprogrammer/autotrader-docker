import tradeModel from '@/modules/trade/trade.model'
import { ITrade, ITradeObject } from '@/modules/trade/trade.interface'
import { Inject, Service } from 'typedi'
import {
  IInvestment,
  IInvestmentObject,
  IInvestmentService,
} from '@/modules/investment/investment.interface'
import investmentModel from '@/modules/investment/investment.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { InvestmentStatus } from '@/modules/investment/investment.enum'
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
import AppException from '@/modules/app/app.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import FormatNumber from '@/utils/formats/formatNumber'
import { TUpdateInvestmentStatus } from './investment.type'
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'
import userModel from '../user/user.model'
import { TradeStatus } from '../trade/trade.enum'

@Service()
class InvestmentService implements IInvestmentService {
  private investmentRepository = new AppRepository<IInvestment>(investmentModel)
  private tradeRepository = new AppRepository<ITrade>(tradeModel)
  private userRepository = new AppRepository<IUser>(userModel)

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
    @Inject(ServiceToken.TRANSACTION_MANAGER_SERVICE)
    private transactionManagerService: ITransactionManagerService<any>
  ) {}

  private async find(
    investmentId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IInvestment> {
    const investment = await this.investmentRepository
      .findById(investmentId, fromAllAccounts, userId)
      .collect()

    if (!investment) throw new HttpException(404, 'Investment plan not found')

    return investment
  }

  public async get(investmentId: AppObjectId): Promise<IInvestmentObject> {
    return this.investmentRepository.toObject(await this.find(investmentId))
  }

  // public async getAllRunningAuto(): Promise

  public async _createTransaction(
    user: IUserObject,
    plan: IPlanObject,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = this.investmentRepository.create({
      plan: plan._id,
      planObject: plan,
      user: user._id,
      userObject: user,
      timeLeft: plan.duration * 1000 * 60 * 60 * 24,
      gas: plan.gas,
      amount,
      balance: amount,
      account,
      environment,
      status: InvestmentStatus.AWAITING_TRADE,
      manualMode: plan.manualMode,
    })

    const unsavedInvestment = investment.collectUnsaved()

    return {
      object: unsavedInvestment,
      instance: {
        model: investment,
        onFailed: `Delete the investment with an id of (${unsavedInvestment._id})`,
        async callback() {
          await investment.deleteOne()
        },
      },
    }
  }

  public async _updateStatusTransaction(
    investmentId: AppObjectId,
    status: InvestmentStatus
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = await this.find(investmentId)

    const oldStatus = investment.status

    if (oldStatus === InvestmentStatus.COMPLETED)
      throw new HttpException(400, 'Investment plan has already been settled')

    investment.status = status

    const newInvestment = this.investmentRepository.toClass(investment)

    const unsavedInvestment = newInvestment.collectUnsaved()

    return {
      object: unsavedInvestment,
      instance: {
        model: newInvestment,
        onFailed: `Set the status of the investment with an id of (${unsavedInvestment._id}) to (${oldStatus})`,
        callback: async () => {
          unsavedInvestment.status = oldStatus
          await this.investmentRepository.save(unsavedInvestment)
        },
      },
    }
  }

  public async updateTradeDetailsTransaction(
    investmentId: AppObjectId,
    trade: ITradeObject
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = await this.find(investmentId)

    const oldTradeStatus = investment.tradeStatus
    const oldTradeStart = investment.tradeStart
    const oldBalance = investment.balance

    investment.tradeStatus = trade.status
    investment.tradeStart = trade.startTime

    if (trade.status === TradeStatus.SETTLED) {
      investment.balance += trade.profit
    }

    const newInvestment = this.investmentRepository.toClass(investment)

    const unsavedInvestment = newInvestment.collectUnsaved()

    return {
      object: unsavedInvestment,
      instance: {
        model: newInvestment,
        onFailed: `Set the tradeStatus of the investment with an id of (${unsavedInvestment._id}) to (${oldTradeStatus}) and the tradeStart to (${oldTradeStart}) and the balance to (${oldBalance})`,
        callback: async () => {
          unsavedInvestment.tradeStatus = oldTradeStatus
          unsavedInvestment.tradeStart = oldTradeStart
          unsavedInvestment.balance = oldBalance
          await this.investmentRepository.save(unsavedInvestment)
        },
      },
    }
  }

  public create = async (
    planId: AppObjectId,
    userId: AppObjectId,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): THttpResponse<{ investment: IInvestment }> => {
    try {
      const plan = await this.planService.get(planId)

      if (!plan)
        throw new HttpException(404, 'The selected plan no longer exist')

      if (plan.minAmount > amount || plan.maxAmount < amount)
        throw new HttpException(
          400,
          `The amount allowed in this plan is between ${FormatNumber.toDollar(
            plan.minAmount
          )} and ${FormatNumber.toDollar(plan.maxAmount)}.`
        )

      const transactionInstances: ITransactionInstance<any>[] = []

      const { instance: userInstance, object: user } =
        await this.userService.fund(userId, account, amount)

      transactionInstances.push(userInstance)

      const { instance: investmentInstance, object: investment } =
        await this._createTransaction(user, plan, amount, account, environment)

      transactionInstances.push(investmentInstance)

      if (environment === UserEnvironment.LIVE) {
        const referralInstances = await this.referralService.create(
          ReferralTypes.INVESTMENT,
          user,
          investment.amount
        )

        referralInstances.forEach((instance) => {
          transactionInstances.push(instance)
        })
      }

      const transactionInstance = await this.transactionService.create(
        user,
        investment.status,
        TransactionCategory.INVESTMENT,
        investment,
        amount,
        environment,
        amount
      )

      transactionInstances.push(transactionInstance)

      const userNotificationInstance = await this.notificationService.create(
        `Your investment of ${formatNumber.toDollar(amount)} on the ${
          plan.name
        } plan is up and running`,
        NotificationCategory.INVESTMENT,
        investment,
        NotificationForWho.USER,
        investment.status,
        environment,
        user
      )

      transactionInstances.push(userNotificationInstance)

      const adminNotificationInstance = await this.notificationService.create(
        `${user.username} just invested in the ${
          plan.name
        } plan with the sum of ${formatNumber.toDollar(
          amount
        )}, on his ${environment} account`,
        NotificationCategory.INVESTMENT,
        investment,
        NotificationForWho.ADMIN,
        investment.status,
        environment
      )

      transactionInstances.push(adminNotificationInstance)

      await this.transactionManagerService.execute(transactionInstances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Investment has been registered successfully',
        data: { investment: investmentInstance.model.collectRaw() },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to register this investment, please try again'
      )
    }
  }

  public async updateStatus(
    investmentId: AppObjectId,
    status: InvestmentStatus,
    sendNotice: boolean = true
  ): Promise<{
    model: AppRepository<IInvestment>
    instances: TUpdateInvestmentStatus
  }> {
    const transactionInstances: TUpdateInvestmentStatus = []

    const { object: investment, instance: investmentInstance } =
      await this._updateStatusTransaction(investmentId, status)

    transactionInstances.push(investmentInstance)

    let user
    if (status === InvestmentStatus.COMPLETED) {
      const userTransaction = await this.userService.fund(
        investment.user,
        UserAccount.MAIN_BALANCE,
        investment.balance
      )

      user = userTransaction.object
      const userInstance = userTransaction.instance

      transactionInstances.push(userInstance)

      const transactionInstance = await this.transactionService.updateAmount(
        investment._id,
        investment.status,
        investment.balance
      )

      transactionInstances.push(transactionInstance)

      if (investment.environment === UserEnvironment.LIVE) {
        const referralInstances = await this.referralService.create(
          ReferralTypes.COMPLETED_PACKAGE_EARNINGS,
          user,
          investment.balance - investment.amount
        )

        referralInstances.forEach((instance) => {
          transactionInstances.push(instance)
        })
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
          notificationMessage = 'is awaiting the current trade'
          break
        case InvestmentStatus.PROCESSING_TRADE:
          notificationMessage = 'is processing the next trade'
          break
      }

      if (notificationMessage) {
        const receiver = user
          ? user
          : await this.userService.get(investment.user)

        const notificationInstance = await this.notificationService.create(
          `Your investment package ${notificationMessage}`,
          NotificationCategory.INVESTMENT,
          investment,
          NotificationForWho.USER,
          status,
          investment.environment,
          receiver
        )

        transactionInstances.push(notificationInstance)
      }
    }

    return {
      model: investmentInstance.model,
      instances: transactionInstances,
    }
  }

  public async forceFund(
    investmentId: AppObjectId,
    amount: number
  ): THttpResponse<{ investment: IInvestment }> {
    try {
      const investment = await this.find(investmentId)

      investment.balance += amount

      await investment.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Investment has been funded successfully',
        data: { investment },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fund this investment, please try again'
      )
    }
  }

  public async refill(
    investmentId: AppObjectId,
    gass: number
  ): THttpResponse<{ investment: IInvestment }> {
    try {
      const investment = await this.find(investmentId)

      investment.gas += gass

      await investment.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Investment has been refilled successfully',
        data: { investment },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to refill this investment, please try again'
      )
    }
  }

  public delete = async (
    investmentId: AppObjectId
  ): THttpResponse<{ investment: IInvestment }> => {
    try {
      const investment = await this.find(investmentId)

      if (investment.status !== InvestmentStatus.COMPLETED)
        throw new HttpException(400, 'Investment has not been settled yet')

      await this.investmentRepository.deleteOne({ _id: investment._id })

      await this.tradeRepository.deleteMany({ investment: investmentId })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Investment deleted successfully',
        data: { investment },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete this investment, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean,
    environment: UserEnvironment,
    userId: AppObjectId
  ): THttpResponse<{ investments: IInvestment[] }> => {
    try {
      const investments = await this.investmentRepository
        .find({ environment }, all, {
          user: userId,
        })
        .select('-userObject -plan')
        .collectAll()

      await this.investmentRepository.populateAll(
        investments,
        'user',
        'userObject',
        'username isDeleted',
        this.userRepository
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Investment history fetched successfully',
        data: { investments },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch investment history, please try again'
      )
    }
  }
}

export default InvestmentService
