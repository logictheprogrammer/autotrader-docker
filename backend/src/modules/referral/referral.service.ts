import { Inject, Service } from 'typedi'
import {
  IReferral,
  IReferralEarnings,
  IReferralLeaderboard,
  IReferralObject,
  IReferralService,
} from '@/modules/referral/referral.interface'
import referralModel from '@/modules/referral/referral.model'
import { ReferralStatus, ReferralTypes } from '@/modules/referral/referral.enum'
import ServiceToken from '@/utils/enums/serviceToken'
import {
  INotification,
  INotificationService,
} from '@/modules/notification/notification.interface'
import { IReferralSettingsService } from '@/modules/referralSettings/referralSettings.interface'
import formatNumber from '@/utils/formats/formatNumber'
import { IUser, IUserObject, IUserService } from '@/modules/user/user.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { Query, Types } from 'mongoose'
import {
  ITransaction,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import ServiceQuery from '@/modules/service/service.query'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import HttpException from '@/modules/http/http.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import AllowedException from '@/utils/exceptions/allowedException'
import ServiceException from '@/modules/service/service.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import FormatString from '@/utils/formats/formatString'

@Service()
class ReferralService implements IReferralService {
  private referralModel = new ServiceQuery<IReferral>(referralModel)

  constructor(
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @Inject(ServiceToken.REFERRAL_SETTINGS_SERVICE)
    private referralSettingsService: IReferralSettingsService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService
  ) {}

  private async find(
    referralId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<IReferral> {
    const referral = await this.referralModel.findById(
      referralId,
      fromAllAccounts,
      userId
    )

    if (!referral) throw new HttpException(404, 'Referral not found')

    return referral
  }

  private findAll(
    fromAllAccounts: boolean,
    userId?: Types.ObjectId
  ): Query<IReferral[], IReferral, {}, IReferral> {
    try {
      const referralTransactions = this.referralModel.find(
        {},
        fromAllAccounts,
        {
          referrer: userId,
        }
      )

      return referralTransactions
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }

  public async _calcAmountEarn(
    type: ReferralTypes,
    amount: number
  ): Promise<{ earn: number; rate: number }> {
    const referralSettings = await this.referralSettingsService.get()

    const rate = referralSettings[type]
    const earn = (rate / 100) * amount

    return { earn, rate }
  }

  public async _createTransaction(
    referrer: IUserObject,
    user: IUserObject,
    type: ReferralTypes,
    rate: number,
    earn: number
  ): TTransaction<IReferralObject, IReferral> {
    const referral = new this.referralModel.self({
      rate,
      type,
      referrer: referrer._id,
      referrerObject: referrer,
      user: user._id,
      userObject: user,
      amount: earn,
    })

    return {
      object: referral.toObject(),
      instance: {
        model: referral,
        onFailed: `Delete Referral Transaction with an id of (${referral._id})`,
        async callback() {
          await referral.deleteOne()
        },
      },
    }
  }

  public async create(
    type: ReferralTypes,
    user: IUserObject,
    amount: number
  ): Promise<
    ITransactionInstance<IReferral | ITransaction | INotification | IUser>[]
  > {
    try {
      const userReferrerId = user.referred
      try {
        if (!userReferrerId) throw new HttpException(404, 'Referrer not found')
        if (!Types.ObjectId.isValid(userReferrerId))
          throw new HttpException(404, 'Referrer not found')
      } catch (error) {
        throw new AllowedException(error)
      }

      const { earn, rate } = await this._calcAmountEarn(type, amount)

      let userReferralTransaction
      try {
        userReferralTransaction = await this.userService.fund(
          userReferrerId,
          UserAccount.REFERRAL_BALANCE,
          earn
        )
      } catch (error) {
        throw new AllowedException(error)
      }

      const transactionInstances: ITransactionInstance<
        IReferral | ITransaction | INotification | IUser
      >[] = []

      const { object: userReferrer, instance: userReferrerInstance } =
        userReferralTransaction

      transactionInstances.push(userReferrerInstance)

      const {
        object: referralTransaction,
        instance: referralTransactionInstance,
      } = await this._createTransaction(userReferrer, user, type, rate, earn)

      transactionInstances.push(referralTransactionInstance)

      const message = `Your referral account has been credited with ${formatNumber.toDollar(
        earn
      )}, from ${user.username} ${FormatString.fromCamelToTitleCase(
        type
      )} of ${formatNumber.toDollar(amount)}`
      const category = NotificationCategory.REFERRAL
      const forWho = NotificationForWho.USER
      const status = ReferralStatus.SUCCESS

      const userReferrerNotificationInstance =
        await this.notificationService.create(
          message,
          category,
          referralTransaction,
          forWho,
          status,
          UserEnvironment.LIVE,
          userReferrer
        )

      transactionInstances.push(userReferrerNotificationInstance)

      const adminMessage = `${
        userReferrer.username
      } referral account has been credited with ${formatNumber.toDollar(
        earn
      )}, from ${user.username} ${type} of ${formatNumber.toDollar(amount)}`

      const adminNotificationInstance = await this.notificationService.create(
        adminMessage,
        category,
        referralTransaction,
        NotificationForWho.ADMIN,
        ReferralStatus.SUCCESS,
        UserEnvironment.LIVE
      )

      transactionInstances.push(adminNotificationInstance)

      const userReferrerTransactionInstance =
        await this.transactionService.create(
          userReferrer,
          ReferralStatus.SUCCESS,
          TransactionCategory.REFERRAL,
          referralTransaction,
          earn,
          UserEnvironment.LIVE
        )

      transactionInstances.push(userReferrerTransactionInstance)

      return transactionInstances
    } catch (err: any) {
      if (err.allow) return []
      throw new ServiceException(
        err,
        'Failed to register referral transactions, please try again'
      )
    }
  }

  public fetchAll = async (
    fromAllAccounts: boolean,
    userId?: Types.ObjectId
  ): THttpResponse<{ referralTransactions: IReferral[] }> => {
    try {
      const referralTransactions = await this.findAll(
        fromAllAccounts,
        userId
      ).select('-userObject -referrerObject')

      await this.referralModel.populate(
        referralTransactions,
        'user',
        'userObject',
        'username isDeleted'
      )

      await this.referralModel.populate(
        referralTransactions,
        'referrer',
        'referrerObject',
        'username isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Referral transactions fetched',
        data: { referralTransactions },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }

  public earnings = async (
    fromAllAccounts: boolean,
    userId?: Types.ObjectId
  ): THttpResponse<{ referralEarnings: IReferralEarnings[] }> => {
    try {
      const referralTransactions = await this.findAll(
        fromAllAccounts,
        userId
      ).select('-userObject -referrerObject')

      await this.referralModel.populate(
        referralTransactions,
        'user',
        'userObject',
        'username isDeleted createdAt'
      )

      await this.referralModel.populate(
        referralTransactions,
        'referrer',
        'referrerObject',
        'username isDeleted'
      )

      const referralEarnings: IReferralEarnings[] = []

      referralTransactions.forEach((transation) => {
        const index = referralEarnings.findIndex(
          (obj) => obj.user._id.toString() === transation.user._id.toString()
        )
        if (index !== -1) {
          referralEarnings[index].earnings += transation.amount
        } else {
          referralEarnings.push({
            user: {
              _id: transation.user._id,
              username: transation.user.username,
              createdAt: transation.user.createdAt,
            },
            earnings: transation.amount,
            referrer: {
              _id: transation.referrer._id,
              username: transation.referrer.username,
            },
          })
        }
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Referral earnings fetched',
        data: { referralEarnings },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }

  public async leaderboard(): THttpResponse<{
    referralLeaderboard: IReferralLeaderboard[]
  }> {
    try {
      const referralTransactions = await this.findAll(true).select(
        '-userObject -referrerObject -user'
      )

      await this.referralModel.populate(
        referralTransactions,
        'referrer',
        'referrerObject',
        'username isDeleted createdAt'
      )

      const referralLeaderboard: IReferralLeaderboard[] = []

      referralTransactions.forEach((transation) => {
        const index = referralLeaderboard.findIndex(
          (obj) =>
            obj.user._id.toString() === transation.referrer._id.toString()
        )
        if (index !== -1) {
          referralLeaderboard[index].earnings += transation.amount
        } else {
          referralLeaderboard.push({
            user: {
              _id: transation.referrer._id,
              username: transation.referrer.username,
              createdAt: transation.referrer.createdAt,
            },
            earnings: transation.amount,
          })
        }
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Referral leaderboard fetched',
        data: { referralLeaderboard },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }
}

export default ReferralService