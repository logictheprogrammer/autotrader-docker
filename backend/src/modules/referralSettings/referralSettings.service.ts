import { Service } from 'typedi'
import {
  IReferralSettings,
  IReferralSettingsObject,
  IReferralSettingsService,
} from '@/modules/referralSettings/referralSettings.interface'
import referralSettingsModel from '@/modules/referralSettings/referralSettings.model'
import { NotFoundError, ServiceError } from '@/core/apiError'
import { FilterQuery } from 'mongoose'

@Service()
class ReferralSettingsService implements IReferralSettingsService {
  private referralSettingsModel = referralSettingsModel

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
      const referralSettings =
        await this.referralSettingsModel.findOneAndUpdate(
          {},
          {
            deposit,
            stake,
            winnings,
            investment,
            completedPackageEarnings,
          }
        )

      if (!referralSettings)
        throw new NotFoundError('Referral settings not found')

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
    const referralSettings = await this.referralSettingsModel.findOne(filter)

    if (!referralSettings)
      throw new NotFoundError('Referral settings not found')

    return referralSettings
  }
}

export default ReferralSettingsService
