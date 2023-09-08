import { Service } from 'typedi'
import {
  IReferralSettings,
  IReferralSettingsService,
} from '@/modules/referralSettings/referralSettings.interface'
import referralSettingsModel from '@/modules/referralSettings/referralSettings.model'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import AppRepository from '@/modules/app/app.repository'

@Service()
class ReferralSettingsService implements IReferralSettingsService {
  private referralSettingsRepository = new AppRepository<IReferralSettings>(
    referralSettingsModel
  )

  public create = async (
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): THttpResponse<{ referralSettings: IReferralSettings }> => {
    try {
      const referralSettings = await this.referralSettingsRepository
        .create({
          deposit,
          stake,
          winnings,
          investment,
          completedPackageEarnings,
        })
        .save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Referral Settings Created',
        data: { referralSettings },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to create referral settings, please try again'
      )
    }
  }

  public update = async (
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): THttpResponse<{ referralSettings: IReferralSettings }> => {
    try {
      await this.referralSettingsRepository.updateOne(
        {},
        {
          deposit,
          stake,
          winnings,
          investment,
          completedPackageEarnings,
        }
      )

      const referralSettings = await this.get()

      if (!referralSettings)
        throw new HttpException(404, 'Referral settings not found')

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Referral Settings Updated',
        data: { referralSettings },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to update referral settings, please try again'
      )
    }
  }

  public get = async (): Promise<IReferralSettings | undefined> => {
    try {
      const referralSettings = await this.referralSettingsRepository
        .findOne({})
        .collect()

      return referralSettings
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to fetch referral settings, please try again'
      )
    }
  }

  public fetch = async (): THttpResponse<{
    referralSettings: IReferralSettings
  }> => {
    const referralSettings = await this.get()

    if (!referralSettings)
      throw new HttpException(404, 'Referral settings not found')

    return {
      status: HttpResponseStatus.SUCCESS,
      message: 'Referral Settings fetched',
      data: { referralSettings },
    }
  }
}

export default ReferralSettingsService
