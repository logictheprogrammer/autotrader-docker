import baseModelInterface from '@/core/baseModelInterface'
import baseObjectInterface from '@/core/baseObjectInterface'
import { FilterQuery } from 'mongoose'

export interface IReferralSettingsObject extends baseObjectInterface {
  deposit: number
  stake: number
  winnings: number
  investment: number
  completedPackageEarnings: number
}

// @ts-ignore
export interface IReferralSettings
  extends baseModelInterface,
    IReferralSettingsObject {}

export interface IReferralSettingsService {
  create(
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): Promise<IReferralSettingsObject>

  update(
    deposit: number,
    stake: number,
    winnings: number,
    investment: number,
    completedPackageEarnings: number
  ): Promise<IReferralSettingsObject>

  fetch(
    filter: FilterQuery<IReferralSettings>
  ): Promise<IReferralSettingsObject>
}
