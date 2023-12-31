import { Inject, Service } from 'typedi'
import {
  IReferral,
  IReferralEarnings,
  IReferralLeaderboard,
  IReferralObject,
  IReferralService,
} from '@/modules/referral/referral.interface'
import ReferralModel from '@/modules/referral/referral.model'
import { ReferralStatus, ReferralTypes } from '@/modules/referral/referral.enum'
import { INotificationService } from '@/modules/notification/notification.interface'
import { IReferralSettingsService } from '@/modules/referralSettings/referralSettings.interface'
import { IUserObject, IUserService } from '@/modules/user/user.interface'
import {
  NotificationTitle,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionTitle } from '@/modules/transaction/transaction.enum'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { FilterQuery, isValidObjectId } from 'mongoose'
import { NotFoundError } from '@/core/apiError'
import Helpers from '@/utils/helpers'
import ServiceToken from '@/core/serviceToken'

@Service()
class ReferralService implements IReferralService {
  private referralModel = ReferralModel

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
    return await this.referralModel
      .find(filter)
      .populate('user')
      .populate('referrer')
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
    const title = NotificationTitle.REFERRAL_EARNINGS
    const forWho = NotificationForWho.USER

    await this.notificationService.create(
      message,
      title,
      referral,
      forWho,
      UserEnvironment.LIVE,
      userReferrer
    )

    const adminMessage = `${
      userReferrer.username
    } referral account has been credited with ${Helpers.toDollar(earn)}, from ${
      user.username
    } ${type} of ${Helpers.toDollar(amount)}`

    await this.notificationService.create(
      adminMessage,
      title,
      referral,
      NotificationForWho.ADMIN,
      UserEnvironment.LIVE
    )

    await this.transactionService.create(
      userReferrer,
      TransactionTitle.REFERRAL_EARNINGS,
      referral,
      earn,
      UserEnvironment.LIVE
    )

    return (await referral.populate('user')).populate('referrer')
  }

  public async fetchAll(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralObject[]> {
    return await this.findAll(filter)
  }

  public async earnings(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralEarnings[]> {
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
          user: transation.user,
          earnings: transation.amount,
          referrer: transation.referrer,
        })
      }
    })

    return referralEarnings
  }

  public async leaderboard(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralLeaderboard[]> {
    const referralTransactions = await this.findAll(filter)

    const referralLeaderboard: IReferralLeaderboard[] = []

    referralTransactions.forEach((transation) => {
      const index = referralLeaderboard.findIndex(
        (obj) => obj.user._id.toString() === transation.referrer._id.toString()
      )
      if (index !== -1) {
        referralLeaderboard[index].earnings += transation.amount
      } else {
        referralLeaderboard.push({
          user: transation.referrer,
          earnings: transation.amount,
        })
      }
    })

    return referralLeaderboard
  }

  public async delete(
    filter: FilterQuery<IReferral>
  ): Promise<IReferralObject> {
    const referral = await this.referralModel
      .findOne(filter)
      .populate('user')
      .populate('referrer')

    if (!referral) throw new NotFoundError('Referral transcation not found')

    await referral.deleteOne()

    return referral
  }

  public async count(filter: FilterQuery<IReferral>): Promise<number> {
    return await this.referralModel.count(filter)
  }
}

export default ReferralService
