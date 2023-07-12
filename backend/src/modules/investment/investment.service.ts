import tradeModel from '@/modules/trade/trade.model'
import { ITrade } from '@/modules/trade/trade.interface'
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
import ServiceException from '@/modules/service/service.exception'
import ServiceQuery from '@/modules/service/service.query'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import FormatNumber from '@/utils/formats/formatNumber'
import { Types } from 'mongoose'
import { TUpdateInvestmentStatus } from './investment.type'

@Service()
class InvestmentService implements IInvestmentService {
  private investmentModel = new ServiceQuery<IInvestment>(investmentModel)
  private tradeModel = new ServiceQuery<ITrade>(tradeModel)

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
    investmentId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IInvestment> {
    const investment = await this.investmentModel.findById(
      investmentId,
      fromAllAccounts,
      userId
    )

    if (!investment) throw new HttpException(404, 'Investment plan not found')

    return investment
  }

  public async get(investmentId: Types.ObjectId): Promise<IInvestmentObject> {
    return (await this.find(investmentId)).toObject()
  }

  public async _fundTransaction(
    investmentId: Types.ObjectId,
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
      object: investment.toObject(),
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

  public async _createTransaction(
    user: IUserObject,
    plan: IPlanObject,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = new this.investmentModel.self({
      plan: plan._id,
      planObject: plan,
      user: user._id,
      userObject: user,
      icon: plan.icon,
      name: plan.name,
      engine: plan.engine,
      minProfit: plan.minProfit,
      maxProfit: plan.maxProfit,
      duration: plan.duration * 1000 * 60 * 60 * 24,
      gas: plan.gas,
      description: plan.description,
      assetType: plan.assetType,
      assets: plan.assets,
      amount,
      balance: amount,
      account,
      environment,
      status: InvestmentStatus.RUNNING,
    })

    return {
      object: investment.toObject(),
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
    investmentId: Types.ObjectId,
    status: InvestmentStatus
  ): TTransaction<IInvestmentObject, IInvestment> {
    const investment = await this.find(investmentId)

    const oldStatus = investment.status

    if (oldStatus === InvestmentStatus.COMPLETED)
      throw new HttpException(400, 'Investment plan has already been settled')

    switch (status) {
      case InvestmentStatus.MARKET_OPENED:
        status = InvestmentStatus.RUNNING
      case InvestmentStatus.SUSPENDED:
      case InvestmentStatus.MARKET_CLOSED:
      case InvestmentStatus.TRADE_ON_HOLD:
      case InvestmentStatus.INSUFFICIENT_GAS:
        investment.dateSuspended = new Date()
        break
      case InvestmentStatus.RUNNING:
        if (!investment.dateSuspended) break

        const timeDifference =
          new Date().getTime() - investment.dateSuspended.getTime()

        investment.duration += timeDifference

        investment.dateSuspended = undefined
        break
    }

    investment.status = status

    return {
      object: investment.toObject(),
      instance: {
        model: investment,
        onFailed: `Set the status of the investment with an id of (${investment._id}) to (${oldStatus})`,
        async callback() {
          investment.status = oldStatus
          await investment.save()
        },
      },
    }
  }

  public create = async (
    planId: Types.ObjectId,
    userId: Types.ObjectId,
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

      const transactionInstances: ITransactionInstance<
        IInvestment | INotification | IReferral | ITransaction | IUser
      >[] = []

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
        data: { investment: investmentInstance.model },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to register this investment, please try again'
      )
    }
  }

  public async updateStatus(
    investmentId: Types.ObjectId,
    status: InvestmentStatus,
    sendNotice: boolean = true
  ): Promise<{ model: IInvestment; instances: TUpdateInvestmentStatus }> {
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
          notificationMessage = 'is now ' + status
          break
        case InvestmentStatus.SUSPENDED:
          notificationMessage = 'has been ' + status
          break
        case InvestmentStatus.COMPLETED:
          notificationMessage = 'has been ' + status
          break
        case InvestmentStatus.INSUFFICIENT_GAS:
          notificationMessage = 'has ran out of gas'
          break
        case InvestmentStatus.MARKET_CLOSED:
          notificationMessage = 'has closed until the next business hours'
          break
        case InvestmentStatus.MARKET_OPENED:
          notificationMessage = 'has been opened and running'
          break
      }

      if (notificationMessage) {
        const receiver = user
          ? user
          : await this.userService.get(investment.user)

        const notificationInstance = await this.notificationService.create(
          `Your investment of ${formatNumber.toDollar(
            investment.amount
          )} ${notificationMessage}`,
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

    return { model: investmentInstance.model, instances: transactionInstances }
  }

  public forceUpdateStatus = async (
    investmentId: Types.ObjectId,
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
      throw new ServiceException(
        err,
        'Failed to update this investment  status, please try again'
      )
    }
  }

  public async fund(
    investmentId: Types.ObjectId,
    amount: number
  ): TTransaction<IInvestmentObject, IInvestment> {
    return await this._fundTransaction(investmentId, amount)
  }

  public async forceFund(
    investmentId: Types.ObjectId,
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
      throw new ServiceException(
        err,
        'Failed to fund this investment, please try again'
      )
    }
  }

  public async refill(
    investmentId: Types.ObjectId,
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
      throw new ServiceException(
        err,
        'Failed to refill this investment, please try again'
      )
    }
  }

  public delete = async (
    investmentId: Types.ObjectId
  ): THttpResponse<{ investment: IInvestment }> => {
    try {
      const investment = await this.find(investmentId)

      if (investment.status !== InvestmentStatus.COMPLETED)
        throw new HttpException(400, 'Investment has not been settled yet')

      await investment.deleteOne()

      await this.tradeModel.self.deleteOne({ investment: investmentId })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Investment deleted successfully',
        data: { investment },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to delete this investment, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean,
    environment: UserEnvironment,
    userId: Types.ObjectId
  ): THttpResponse<{ investments: IInvestment[] }> => {
    try {
      const investments = await this.investmentModel
        .find({ environment }, all, {
          user: userId,
        })
        .select('-userObject -plan')

      await this.investmentModel.populate(
        investments,
        'user',
        'userObject',
        'username isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Investment history fetched successfully',
        data: { investments },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch investment history, please try again'
      )
    }
  }
}

export default InvestmentService
