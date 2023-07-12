import { Service } from 'typedi'
import {
  IReferralSettings,
  IReferralSettingsService,
} from '@/modules/referralSettings/referralSettings.interface'
import referralSettingsModel from '@/modules/referralSettings/referralSettings.model'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'

@Service()
class ReferralSettingsService implements IReferralSettingsService {
  private referralSettingsModel = new ServiceQuery<IReferralSettings>(
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
      const referralSettings = await this.referralSettingsModel.self.create({
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
      throw new ServiceException(
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
      await this.referralSettingsModel.self.updateOne(
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

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Referral Settings Updated',
        data: { referralSettings },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to update referral settings, please try again'
      )
    }
  }

  public get = async (): Promise<IReferralSettings> => {
    try {
      const referralSettings = await this.referralSettingsModel.findOne({})

      if (!referralSettings)
        throw new HttpException(404, 'Referral settings not found')

      return referralSettings
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to fetch referral settings, please try again'
      )
    }
  }

  public fetch = async (): THttpResponse<{
    referralSettings: IReferralSettings
  }> => {
    const referralSettings = await this.get()

    return {
      status: HttpResponseStatus.SUCCESS,
      message: 'Referral Settings fetched',
      data: { referralSettings },
    }
  }
}

export default ReferralSettingsService
