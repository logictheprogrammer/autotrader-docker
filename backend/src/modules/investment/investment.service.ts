import { ITradeObject } from '@/modules/trade/trade.interface'
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
import { IUserObject, IUserService } from '@/modules/user/user.interface'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IReferralService } from '@/modules/referral/referral.interface'
import { INotificationService } from '@/modules/notification/notification.interface'
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
import { ForecastStatus } from '../forecast/forecast.enum'
import { ObjectId } from 'mongoose'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'
import tradeModel from '../trade/trade.model'
import { IMathService } from '../math/math.interface'

@Service()
class InvestmentService implements IInvestmentService {
  private investmentModel = investmentModel
  private tradeModel = tradeModel

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
    private mathService: IMathService,
    @Inject(ServiceToken.TRANSACTION_MANAGER_SERVICE)
    private transactionManagerService: ITransactionManagerService<any>
  ) {}

  private async find(
    investmentId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IInvestment> {
    let investment

    if (fromAllAccounts) {
      investment = await this.investmentModel.findById(investmentId)
    } else {
      investment = await this.investmentModel.findOne({
        _id: investmentId,
        user: userId,
      })
    }

    if (!investment) throw new HttpException(404, 'Investment plan not found')

    return investment
  }

  public async getAllAutoAwaiting(
    planId: ObjectId
  ): Promise<IInvestmentObject[]> {
    const investments = await this.investmentModel.find({
      manualMode: false,
      status: InvestmentStatus.AWAITING_TRADE,
      plan: planId,
      tradeStatus: { $or: [ForecastStatus.SETTLED, undefined] },
    })

    for (let index = 0; index < investments.length; index++) {
      const investment = investments[index]
      investment.toObject({ getters: true })
    }

    return investments
  }

  public async getAllAutoRunning(
    planId: ObjectId
  ): Promise<IInvestmentObject[]> {
    const investments = await this.investmentModel.find({
      manualMode: false,
      status: InvestmentStatus.RUNNING,
      plan: planId,
      tradeStatus: ForecastStatus.RUNNING,
    })

    for (let index = 0; index < investments.length; index++) {
      const investment = investments[index]
      investment.toObject({ getters: true })
    }

    return investments
  }

  public async get(investmentId: ObjectId): Promise<IInvestmentObject> {
    return (await this.find(investmentId)).toObject({ getters: true })
  }

  public async _createTransaction(
    user: IUserObject,
    plan: IPlanObject,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = new this.investmentModel({
      plan: plan._id,
      planObject: plan,
      user: user._id,
      userObject: user,
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

    return {
      object: investment.toObject({ getters: true }),
      instance: {
        model: investment,
        onFailed: `Delete the investment with an id of (${investment._id})`,
        async callback() {
          await investment.deleteOne()
        },
      },
    }
  }

  public async _updateStatusTransaction(
    investmentId: ObjectId,
    status: InvestmentStatus
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = await this.find(investmentId)

    const oldStatus = investment.status

    if (oldStatus === InvestmentStatus.COMPLETED)
      throw new HttpException(400, 'Investment plan has already been settled')

    investment.status = status

    return {
      object: investment.toObject({ getters: true }),
      instance: {
        model: investment,
        onFailed: `Set the status of the investment with an id of (${investment._id}) to (${oldStatus})`,
        callback: async () => {
          investment.status = oldStatus
          await investment.save()
        },
      },
    }
  }

  public async _updateTradeDetails(
    investmentId: ObjectId,
    tradeObject: ITradeObject
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = await this.find(investmentId)

    const oldStatus = investment.status
    const oldTradeStatus = investment.tradeStatus
    const oldCurrentTrade = investment.currentTrade
    const oldTimeStamps = investment.tradeTimeStamps.slice()
    const oldStartTime = investment.tradeStartTime
    const oldRuntime = investment.runTime
    const oldBalance = investment.balance

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
        throw new HttpException(ErrorCode.BAD_REQUEST, 'Invalid forcast status')
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

    return {
      object: investment.toObject({ getters: true }),
      instance: {
        model: investment,
        onFailed: `Set the investment with an id of (${investment._id}) to the following: 
        \n status = (${oldStatus}),
        \n tradeStatus = (${oldTradeStatus}),
        \n currentTrade = (${oldCurrentTrade}),
        \n tradeTimeStamps = (${oldTimeStamps}),
        \n tradeStartTime = (${oldStartTime}),
        \n runTime = (${oldRuntime}),
        \n balance = (${oldBalance}),
        `,
        callback: async () => {
          investment.status = oldStatus
          investment.tradeStatus = oldTradeStatus
          investment.currentTrade = oldCurrentTrade
          investment.tradeTimeStamps = oldTimeStamps
          investment.tradeStartTime = oldStartTime
          investment.runTime = oldRuntime
          investment.balance = oldBalance
          await investment.save()
        },
      },
    }
  }

  public async _fundTransaction(
    investmentId: ObjectId,
    amount: number
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = await this.find(investmentId)

    investment.balance += amount

    const onFailed = `${amount > 0 ? 'substract' : 'add'} ${
      amount > 0
        ? FormatNumber.toDollar(amount)
        : FormatNumber.toDollar(-amount)
    } ${amount > 0 ? 'from' : 'to'} the investment with an id of (${
      investment._id
    })`

    return {
      object: investment.toObject({ getters: true }),
      instance: {
        model: investment,
        onFailed,
        callback: async () => {
          investment.balance -= amount
          await investment.save()
        },
      },
    }
  }

  public create = async (
    planId: ObjectId,
    userId: ObjectId,
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

      // User Transaction Instance
      const { instance: userInstance, object: user } =
        await this.userService.fund(userId, account, -amount)
      transactionInstances.push(userInstance)

      // Investment Transaction Instance
      const { instance: investmentInstance, object: investment } =
        await this._createTransaction(user, plan, amount, account, environment)
      transactionInstances.push(investmentInstance)

      // Referral Transaction Instance
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

      // Transaction Transaction Instance
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

      // Notification Transaction Instance
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

      // Admin Notification Transaction Instance
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
        data: { investment: investmentInstance.model },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to register this investment, please try again'
      )
    }
  }

  public async updateTradeDetails(
    investmentId: ObjectId,
    tradeObject: ITradeObject
  ): Promise<ITransactionInstance<IInvestment>> {
    return (await this._updateTradeDetails(investmentId, tradeObject)).instance
  }

  public async updateStatus(
    investmentId: ObjectId,
    status: InvestmentStatus,
    sendNotice: boolean = true
  ): Promise<{
    model: IInvestment
    instances: TUpdateInvestmentStatus
  }> {
    const transactionInstances: TUpdateInvestmentStatus = []

    // Investment Transaction Instance
    const { object: investment, instance: investmentInstance } =
      await this._updateStatusTransaction(investmentId, status)
    transactionInstances.push(investmentInstance)

    let user
    if (status === InvestmentStatus.COMPLETED) {
      // User Transaction Instance

      const account =
        investment.account === UserAccount.DEMO_BALANCE
          ? UserAccount.DEMO_BALANCE
          : UserAccount.MAIN_BALANCE

      const userTransaction = await this.userService.fund(
        investment.user,
        account,
        investment.balance
      )

      user = userTransaction.object
      const userInstance = userTransaction.instance

      transactionInstances.push(userInstance)

      // Transaction Transaction Instance
      const transactionInstance = await this.transactionService.updateAmount(
        investment._id,
        investment.status,
        investment.balance
      )
      transactionInstances.push(transactionInstance)

      // Referral Transaction Instance
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

  public forceUpdateStatus = async (
    investmentId: ObjectId,
    status: InvestmentStatus
  ): THttpResponse<{ investment: IInvestment }> => {
    try {
      const result = await this.updateStatus(investmentId, status)

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

  public async fund(
    investmentId: ObjectId,
    amount: number
  ): TTransaction<IInvestmentObject, IInvestment> {
    return await this._fundTransaction(investmentId, amount)
  }

  public async forceFund(
    investmentId: ObjectId,
    amount: number
  ): THttpResponse<{ investment: IInvestment }> {
    try {
      const {
        instance: { model: investment },
      } = await this.fund(investmentId, amount)

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
    investmentId: ObjectId,
    gas: number
  ): THttpResponse<{ investment: IInvestment }> {
    try {
      const investment = await this.find(investmentId)

      investment.gas += gas

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
    investmentId: ObjectId
  ): THttpResponse<{ investment: IInvestment }> => {
    try {
      const investment = await this.find(investmentId)

      if (investment.status !== InvestmentStatus.COMPLETED)
        throw new HttpException(400, 'Investment has not been settled yet')

      await this.investmentModel.deleteOne({ _id: investment._id })
      await this.tradeModel.deleteMany({ investment: investmentId })

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
    userId: ObjectId
  ): THttpResponse<{ investments: IInvestment[] }> => {
    try {
      let investments

      if (all) {
        investments = await this.investmentModel
          .find({ environment })
          .select('-userObject -plan')
          .populate('user', 'username isDeleted')
      } else {
        investments = await this.investmentModel
          .find({ environment, user: userId })
          .select('-userObject -plan')
      }

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
