import { Inject, Service } from 'typedi'
import {
  IWithdrawal,
  IWithdrawalObject,
  IWithdrawalService,
} from '@/modules/withdrawal/withdrawal.interface'
import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import { IWithdrawalMethodService } from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { IUserService } from '@/modules/user/user.interface'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import { BadRequestError, NotFoundError, ServiceError } from '@/core/apiError'
import Helpers from '@/utils/helpers'
import WithdrawalModel from '@/modules/withdrawal/withdrawal.model'

@Service()
class WithdrawalService implements IWithdrawalService {
  private withdrawalModel = WithdrawalModel

  public constructor(
    @Inject(ServiceToken.WITHDRAWAL_METHOD_SERVICE)
    private withdrawalMethodService: IWithdrawalMethodService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
  ) {}

  public async create(
    withdrawalMethodId: ObjectId,
    userId: ObjectId,
    account: UserAccount,
    address: string,
    amount: number
  ): Promise<IWithdrawalObject> {
    try {
      const withdrawalMethod = await this.withdrawalMethodService.fetch({
        _id: withdrawalMethodId,
      })

      if (!withdrawalMethod)
        throw new NotFoundError('Withdrawal method not found')

      if (withdrawalMethod.minWithdrawal > amount)
        throw new BadRequestError(
          'Amount is lower than the min withdrawal of the selected withdrawal method'
        )

      const user = await this.userService.fund(
        { _id: userId },
        account,
        -(amount + withdrawalMethod.fee)
      )

      const withdrawal = new this.withdrawalModel({
        withdrawalMethod: withdrawalMethod,
        user,
        account,
        address,
        amount,
        fee: withdrawalMethod.fee,
        status: WithdrawalStatus.PENDING,
      })

      await this.transactionService.create(
        user,
        withdrawal.status,
        TransactionCategory.WITHDRAWAL,
        withdrawal,
        amount,
        UserEnvironment.LIVE
      )

      await this.notificationService.create(
        `${user.username} just made a withdrawal request of ${Helpers.toDollar(
          amount
        )} awaiting for your approval`,
        NotificationCategory.WITHDRAWAL,
        withdrawal,
        NotificationForWho.ADMIN,
        withdrawal.status,
        UserEnvironment.LIVE
      )

      return withdrawal
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to register this withdrawal, please try again'
      )
    }
  }

  public async delete(
    filter: FilterQuery<IWithdrawal>
  ): Promise<IWithdrawalObject> {
    try {
      const withdrawal = await this.withdrawalModel.findOne(filter)

      if (!withdrawal) throw new NotFoundError('Withdrawal not found')

      if (withdrawal.status === WithdrawalStatus.PENDING)
        throw new BadRequestError('Withdrawal has not been settled yet')

      await withdrawal.deleteOne()

      return withdrawal
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete this withdrawal, please try again'
      )
    }
  }

  public async updateStatus(
    filter: FilterQuery<IWithdrawal>,
    status: WithdrawalStatus
  ): Promise<IWithdrawalObject> {
    try {
      const withdrawal = await this.withdrawalModel.findOne(filter)

      if (!withdrawal) throw new NotFoundError('Withdrawal not found')

      const oldStatus = withdrawal.status

      if (oldStatus !== WithdrawalStatus.PENDING)
        throw new BadRequestError('Withdrawal as already been settled')

      withdrawal.status = status

      await this.transactionService.updateStatus(withdrawal._id, status)

      let user

      if (status === WithdrawalStatus.CANCELLED) {
        user = await this.userService.fund(
          withdrawal.user._id,
          withdrawal.account,
          withdrawal.amount + withdrawal.fee
        )
      } else {
        user = await this.userService.fetch({ _id: withdrawal.user._id })
      }

      await this.notificationService.create(
        `Your withdrawal of ${Helpers.toDollar(
          withdrawal.amount
        )} was ${status}`,
        NotificationCategory.WITHDRAWAL,
        withdrawal,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        user
      )

      return withdrawal
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update this withdrawal status, please try again'
      )
    }
  }

  public async fetch(
    filter: FilterQuery<IWithdrawal>
  ): Promise<IWithdrawalObject> {
    try {
      const withdrawal = await this.withdrawalModel.findOne(filter)

      if (!withdrawal) throw new NotFoundError('Withdrawal not found')

      return withdrawal
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch withdrawal history, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<IWithdrawal>
  ): Promise<IWithdrawalObject[]> {
    try {
      return await this.withdrawalModel
        .find(filter)
        .sort({ createdAt: -1 })
        .populate('user', 'username')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch withdrawal history, please try again'
      )
    }
  }
}

export default WithdrawalService
