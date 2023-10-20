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
import { INotificationService } from '@/modules/notification/notification.interface'
import { IReferralSettingsService } from '@/modules/referralSettings/referralSettings.interface'
import { IUserObject, IUserService } from '@/modules/user/user.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { FilterQuery, isValidObjectId } from 'mongoose'
import { NotFoundError, ServiceError } from '@/core/apiError'
import Helpers from '@/utils/helpers'
import ServiceToken from '@/core/serviceToken'

@Service()
class ReferralService implements IReferralService {
  private referralModel = referralModel

  constructor(
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @Inject(ServiceToken.REFERRAL_SETTINGS_SERVICE)
    private referralSettingsService: IReferralSettingsService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService
  ) {}

  private async findAll(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralObject[]> {
    try {
      return await this.referralModel
        .find(filter)
        .select('-userObject -referrerObject')
        .populate('user', 'username isDeleted createdAt')
        .populate('referrer', 'username isDeleted')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }

  public async _calcAmountEarn(
    type: ReferralTypes,
    amount: number
  ): Promise<{ earn: number; rate: number }> {
    const referralSettings = await this.referralSettingsService.fetch({})

    if (!referralSettings)
      throw new NotFoundError('Referral settings not found')

    const rate = referralSettings[type]
    const earn = (rate / 100) * amount

    return { earn, rate }
  }

  public async create(
    type: ReferralTypes,
    user: IUserObject,
    amount: number
  ): Promise<IReferralObject | undefined> {
    try {
      const userReferrerId = user.referred
      if (!userReferrerId || !isValidObjectId(userReferrerId)) return

      const { earn, rate } = await this._calcAmountEarn(type, amount)

      let userReferrer
      try {
        userReferrer = await this.userService.fund(
          userReferrerId,
          UserAccount.REFERRAL_BALANCE,
          earn
        )
      } catch (error) {
        if (!(error instanceof NotFoundError)) throw error
      }

      if (!userReferrer) return

      const referral = new this.referralModel({
        rate,
        type,
        referrer: userReferrer,
        user,
        amount: earn,
      })

      const message = `Your referral account has been credited with ${Helpers.toDollar(
        earn
      )}, from ${user.username} ${Helpers.fromCamelToTitleCase(
        type
      )} of ${Helpers.toDollar(amount)}`
      const category = NotificationCategory.REFERRAL
      const forWho = NotificationForWho.USER
      const status = ReferralStatus.SUCCESS

      await this.notificationService.create(
        message,
        category,
        referral,
        forWho,
        status,
        UserEnvironment.LIVE,
        userReferrer
      )

      const adminMessage = `${
        userReferrer.username
      } referral account has been credited with ${Helpers.toDollar(
        earn
      )}, from ${user.username} ${type} of ${Helpers.toDollar(amount)}`

      await this.notificationService.create(
        adminMessage,
        category,
        referral,
        NotificationForWho.ADMIN,
        ReferralStatus.SUCCESS,
        UserEnvironment.LIVE
      )

      await this.transactionService.create(
        userReferrer,
        ReferralStatus.SUCCESS,
        TransactionCategory.REFERRAL,
        referral,
        earn,
        UserEnvironment.LIVE
      )

      return referral
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to register referral transactions, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralObject[]> {
    try {
      return await this.findAll(filter)
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }

  public async earnings(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralEarnings[]> {
    try {
      const referralTransactions = await this.findAll(filter)

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

      return referralEarnings
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }

  public async leaderboard(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralLeaderboard[]> {
    try {
      const referralTransactions = await this.findAll(filter)

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

      return referralLeaderboard
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch referral transactions, please try again'
      )
    }
  }
}

export default ReferralService
