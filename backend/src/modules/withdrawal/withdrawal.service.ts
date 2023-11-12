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
import { TransactionTitle } from '@/modules/transaction/transaction.enum'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationTitle,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import { BadRequestError, NotFoundError } from '@/core/apiError'
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
    const withdrawalMethod = await this.withdrawalMethodService.fetch({
      _id: withdrawalMethodId,
    })

    if (withdrawalMethod.minWithdrawal > amount)
      throw new BadRequestError(
        'Amount is lower than the min withdrawal of the selected withdrawal method'
      )

    const user = await this.userService.fund(
      { _id: userId },
      account,
      -(amount + withdrawalMethod.fee)
    )

    const withdrawal = await this.withdrawalModel.create({
      withdrawalMethod,
      currency: withdrawalMethod.currency,
      user,
      account,
      address,
      amount,
      fee: withdrawalMethod.fee,
      status: WithdrawalStatus.PENDING,
    })

    await this.notificationService.create(
      `${user.username} just made a withdrawal request of ${Helpers.toDollar(
        amount
      )} awaiting for your approval`,
      NotificationTitle.WITHDRAWAL_REQUEST,
      withdrawal,
      NotificationForWho.ADMIN,
      UserEnvironment.LIVE
    )

    return (await withdrawal.populate('user')).populate('withdrawalMethod')
  }

  public async delete(
    filter: FilterQuery<IWithdrawal>
  ): Promise<IWithdrawalObject> {
    const withdrawal = await this.withdrawalModel.findOne(filter)

    if (!withdrawal) throw new NotFoundError('Withdrawal not found')

    if (withdrawal.status === WithdrawalStatus.PENDING)
      throw new BadRequestError('Withdrawal has not been settled yet')

    await withdrawal.deleteOne()

    return withdrawal
  }

  public async updateStatus(
    filter: FilterQuery<IWithdrawal>,
    status: WithdrawalStatus
  ): Promise<IWithdrawalObject> {
    const withdrawal = await this.withdrawalModel
      .findOne(filter)
      .populate('user')
      .populate('withdrawalMethod')
      .populate('currency')

    if (!withdrawal) throw new NotFoundError('Withdrawal not found')

    const oldStatus = withdrawal.status

    if (oldStatus !== WithdrawalStatus.PENDING)
      throw new BadRequestError('Withdrawal as already been settled')

    withdrawal.status = status

    await withdrawal.save()

    let user

    if (status === WithdrawalStatus.CANCELLED) {
      user = await this.userService.fund(
        withdrawal.user._id,
        withdrawal.account,
        withdrawal.amount + withdrawal.fee
      )

      await this.transactionService.create(
        user,
        TransactionTitle.WITHDRAWAL_FAILED,
        withdrawal,
        withdrawal.amount,
        UserEnvironment.LIVE
      )

      await this.notificationService.create(
        `Your withdrawal of ${Helpers.toDollar(
          withdrawal.amount
        )} was not successful`,
        NotificationTitle.WITHDRAWAL_FAILED,
        withdrawal,
        NotificationForWho.USER,
        UserEnvironment.LIVE,
        user
      )
    } else {
      user = await this.userService.fetch({ _id: withdrawal.user._id })

      await this.transactionService.create(
        user,
        TransactionTitle.WITHDRAWAL_SUCCESSFUL,
        withdrawal,
        withdrawal.amount,
        UserEnvironment.LIVE
      )

      await this.notificationService.create(
        `Your withdrawal of ${Helpers.toDollar(
          withdrawal.amount
        )} was successful`,
        NotificationTitle.WITHDRAWAL_SUCCESSFUL,
        withdrawal,
        NotificationForWho.USER,
        UserEnvironment.LIVE,
        user
      )
    }

    return withdrawal
  }

  public async fetch(
    filter: FilterQuery<IWithdrawal>
  ): Promise<IWithdrawalObject> {
    const withdrawal = await this.withdrawalModel
      .findOne(filter)
      .populate('user')
      .populate('withdrawalMethod')
      .populate('currency')

    if (!withdrawal) throw new NotFoundError('Withdrawal not found')

    return withdrawal
  }

  public async fetchAll(
    filter: FilterQuery<IWithdrawal>
  ): Promise<IWithdrawalObject[]> {
    return await this.withdrawalModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('withdrawalMethod')
      .populate('currency')
  }

  public async count(filter: FilterQuery<IWithdrawal>): Promise<number> {
    return await this.withdrawalModel.count(filter)
  }
}

export default WithdrawalService
