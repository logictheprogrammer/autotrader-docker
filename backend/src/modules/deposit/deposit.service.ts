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
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IReferralService } from '@/modules/referral/referral.interface'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { ReferralTypes } from '@/modules/referral/referral.enum'

import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'

import { FilterQuery, ObjectId } from 'mongoose'
import { BadRequestError, NotFoundError, ServiceError } from '@/core/apiError'
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
    try {
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

      await this.transactionService.create(
        user,
        deposit.status,
        TransactionCategory.DEPOSIT,
        deposit,
        amount,
        UserEnvironment.LIVE
      )

      await this.notificationService.create(
        `${user.username} just made a deposit request of ${Helpers.toDollar(
          amount
        )} awaiting for your approval`,
        NotificationCategory.DEPOSIT,
        deposit,
        NotificationForWho.ADMIN,
        deposit.status,
        UserEnvironment.LIVE
      )

      return deposit
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to register this deposit, please try again'
      )
    }
  }

  public async delete(filter: FilterQuery<IDeposit>): Promise<IDepositObject> {
    try {
      const deposit = await this.depositModel
        .findOne(filter)
        .populate('user')
        .populate('depositMethod')

      if (!deposit) throw new NotFoundError('Deposit not found')

      if (deposit.status === DepositStatus.PENDING)
        throw new BadRequestError('Deposit has not been settled yet')

      await deposit.deleteOne()
      return deposit
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete this deposit, please try again'
      )
    }
  }

  public async updateStatus(
    filter: FilterQuery<IDeposit>,
    status: DepositStatus
  ): Promise<IDepositObject> {
    try {
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
          deposit.user._id,
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

      await this.transactionService.updateStatus(
        { category: deposit._id },
        status
      )

      await this.notificationService.create(
        `Your deposit of ${Helpers.toDollar(deposit.amount)} was ${status}`,
        NotificationCategory.DEPOSIT,
        deposit,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        user
      )

      return deposit
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update this deposit  status, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<IDeposit>
  ): Promise<IDepositObject[]> {
    try {
      return await this.depositModel
        .find(filter)
        .sort({ createdAt: -1 })
        .populate('user')
        .populate('depositMethod')
        .populate('currency')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch deposit history, please try again'
      )
    }
  }
}

export default DepositService
