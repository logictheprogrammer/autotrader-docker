import { Service } from 'typedi'
import {
  IReferralSettings,
  IReferralSettingsObject,
  IReferralSettingsService,
} from '@/modules/referralSettings/referralSettings.interface'
import ReferralSettingsModel from '@/modules/referralSettings/referralSettings.model'
import { NotFoundError } from '@/core/apiError'
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
    const referralSettings = await this.referralSettingsModel.create({
      deposit,
      stake,
      winnings,
      investment,
      completedPackageEarnings,
    })

    return referralSettings
  }

  public async update(
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): Promise<IReferralSettingsObject> {
    const referralSettings = await this.referralSettingsModel.findOne()

    if (!referralSettings)
      throw new NotFoundError('Referral settings not found')

    referralSettings.deposit = deposit
    referralSettings.stake = stake
    referralSettings.winnings = winnings
    referralSettings.investment = investment
    referralSettings.completedPackageEarnings = completedPackageEarnings

    await referralSettings.save()

    return referralSettings
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
