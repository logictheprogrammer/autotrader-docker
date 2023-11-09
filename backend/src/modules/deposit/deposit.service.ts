import { Inject, Service } from 'typedi'
import {
  IDeposit,
  IDepositObject,
  IDepositService,
} from '@/modules/deposit/deposit.interface'
import { DepositStatus } from '@/modules/deposit/deposit.enum'
import { IDepositMethodService } from '@/modules/depositMethod/depositMethod.interface'
import { IUserObject, IUserService } from '@/modules/user/user.interface'
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
import Helpers from '@/utils/helpers'
import ServiceToken from '@/core/serviceToken'
import { DepositMethodStatus } from '../depositMethod/depositMethod.enum'
import DepositModel from '@/modules/deposit/deposit.model'

@Service()
class DepositService implements IDepositService {
  private depositModel = DepositModel

  public constructor(
    @Inject(ServiceToken.DEPOSIT_METHOD_SERVICE)
    private depositMethodService: IDepositMethodService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.REFERRAL_SERVICE)
    private referralService: IReferralService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
  ) {}

  public async create(
    depositMethodId: ObjectId,
    userId: ObjectId,
    amount: number
  ): Promise<IDepositObject> {
    const depositMethod = await this.depositMethodService.fetch({
      _id: depositMethodId,
      status: DepositMethodStatus.ENABLED,
    })

    if (depositMethod.minDeposit > amount)
      throw new BadRequestError(
        'Amount is lower than the min deposit of the selected deposit method'
      )

    const user = await this.userService.fetch({ _id: userId })

    const deposit = await this.depositModel.create({
      depositMethod,
      currency: depositMethod.currency,
      user,
      amount,
      fee: depositMethod.fee,
      status: DepositStatus.PENDING,
    })

    await this.notificationService.create(
      `${user.username} just made a deposit request of ${Helpers.toDollar(
        amount
      )} awaiting for your approval`,
      NotificationTitle.DEPOSIT_MADE,
      deposit,
      NotificationForWho.ADMIN,
      UserEnvironment.LIVE
    )

    return (
      await (await deposit.populate('user')).populate('depositMethod')
    ).populate('currency')
  }

  public async delete(filter: FilterQuery<IDeposit>): Promise<IDepositObject> {
    const deposit = await this.depositModel.findOne(filter)

    if (!deposit) throw new NotFoundError('Deposit not found')

    if (deposit.status === DepositStatus.PENDING)
      throw new BadRequestError('Deposit has not been settled yet')

    await deposit.deleteOne()
    return deposit
  }

  public async updateStatus(
    filter: FilterQuery<IDeposit>,
    status: DepositStatus
  ): Promise<IDepositObject> {
    const deposit = await this.depositModel
      .findOne(filter)
      .populate('user')
      .populate('depositMethod')
      .populate('currency')

    if (!deposit) throw new NotFoundError('Deposit not found')

    const oldStatus = deposit.status

    if (oldStatus !== DepositStatus.PENDING)
      throw new BadRequestError('Deposit as already been settled')

    deposit.status = status

    await deposit.save()

    let user: IUserObject
    if (status === DepositStatus.APPROVED) {
      user = await this.userService.fund(
        { _id: deposit.user._id },
        UserAccount.MAIN_BALANCE,
        deposit.amount - deposit.fee
      )

      await this.referralService.create(
        ReferralTypes.DEPOSIT,
        user,
        deposit.amount
      )
    } else {
      user = await this.userService.fetch({ _id: deposit.user._id })
    }

    if (status === DepositStatus.CANCELLED) {
      await this.notificationService.create(
        `Your deposit of ${Helpers.toDollar(
          deposit.amount
        )} was not successful`,
        NotificationTitle.DEPOSIT_FAILED,
        deposit,
        NotificationForWho.USER,
        UserEnvironment.LIVE,
        user
      )

      await this.transactionService.create(
        user,
        TransactionTitle.DEPOSIT_FAILED,
        deposit,
        deposit.amount,
        UserEnvironment.LIVE
      )
    } else if (status === DepositStatus.APPROVED) {
      await this.notificationService.create(
        `Your deposit of ${Helpers.toDollar(deposit.amount)} was successful`,
        NotificationTitle.DEPOSIT_SUCCESSFUL,
        deposit,
        NotificationForWho.USER,
        UserEnvironment.LIVE,
        user
      )

      await this.transactionService.create(
        user,
        TransactionTitle.DEPOSIT_SUCCESSFUL,
        deposit,
        deposit.amount,
        UserEnvironment.LIVE
      )
    }

    return deposit
  }

  public async fetchAll(
    filter: FilterQuery<IDeposit>
  ): Promise<IDepositObject[]> {
    return await this.depositModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('depositMethod')
      .populate('currency')
  }
}

export default DepositService
