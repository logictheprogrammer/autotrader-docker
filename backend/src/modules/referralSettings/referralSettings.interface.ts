import { Document } from 'mongoose'
import { THttpResponse } from '@/modules/http/http.type'

export interface IReferralSettings extends Document {
  deposit: number
  stake: number
  winnings: number
  investment: number
  completedPackageEarnings: number
}

export interface IReferralSettingsService {
  create(
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): THttpResponse<{ referralSettings: IReferralSettings }>

  update(
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): THttpResponse<{ referralSettings: IReferralSettings }>

  get(): Promise<IReferralSettings>

  fetch(): THttpResponse<{ referralSettings: IReferralSettings }>
}
