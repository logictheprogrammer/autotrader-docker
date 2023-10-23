import { Service } from 'typedi'
import {
  IReferralSettings,
  IReferralSettingsObject,
  IReferralSettingsService,
} from '@/modules/referralSettings/referralSettings.interface'
import ReferralSettingsModel from '@/modules/referralSettings/referralSettings.model'
import { NotFoundError, ServiceError } from '@/core/apiError'
import { FilterQuery } from 'mongoose'

@Service()
class ReferralSettingsService implements IReferralSettingsService {
  private referralSettingsModel = ReferralSettingsModel

  public async create(
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): Promise<IReferralSettingsObject> {
    try {
      const referralSettings = await this.referralSettingsModel.create({
        deposit,
        stake,
        winnings,
        investment,
        completedPackageEarnings,
      })

      return referralSettings
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to create referral settings, please try again'
      )
    }
  }

  public async update(
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): Promise<IReferralSettingsObject> {
    try {
      const referralSettings = await this.referralSettingsModel.findOne()

      if (!referralSettings)
        throw new NotFoundError('Referral settings not found')

      referralSettings.deposit = deposit
      referralSettings.stake = stake
      referralSettings.winnings = winnings
      referralSettings.investment = investment
      referralSettings.completedPackageEarnings = completedPackageEarnings

      return referralSettings
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to update referral settings, please try again'
      )
    }
  }

  public async fetch(
    filter: FilterQuery<IReferralSettings>
  ): Promise<IReferralSettingsObject> {
    try {
      const referralSettings = await this.referralSettingsModel.findOne(filter)

      if (!referralSettings)
        throw new NotFoundError('Referral settings not found')

      return referralSettings
    } catch (error) {
      throw new ServiceError(
        error,
        'Unable to fetch referral settings, please try again'
      )
    }
  }
}

export default ReferralSettingsService
