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

@Service()
class ReferralSettingsService implements IReferralSettingsService {
  private referralSettingsModel = referralSettingsModel

  public create = async (
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): THttpResponse<{ referralSettings: IReferralSettings }> => {
    try {
      const referralSettings = await this.referralSettingsModel.create({
        deposit,
        stake,
        winnings,
        investment,
        completedPackageEarnings,
      })

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
      await this.referralSettingsModel.updateOne(
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

  public get = async (): Promise<IReferralSettings | null> => {
    try {
      const referralSettings = await this.referralSettingsModel.findOne({})

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
