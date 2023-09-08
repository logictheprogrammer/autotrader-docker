import { THttpResponse } from '@/modules/http/http.type'
import AppDocument from '../app/app.document'

export interface IReferralSettings extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
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

  get(): Promise<IReferralSettings | undefined>

  fetch(): THttpResponse<{ referralSettings: IReferralSettings }>
}
