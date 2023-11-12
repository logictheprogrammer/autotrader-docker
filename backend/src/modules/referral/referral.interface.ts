import { ReferralTypes } from '@/modules/referral/referral.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IReferralObject extends baseObjectInterface {
  rate: number
  type: ReferralTypes
  referrer: IUser['_id']
  user: IUser['_id']
  amount: number
}

// @ts-ignore
export interface IReferral extends baseModelInterface, IReferralObject {}

export interface IReferralEarnings {
  user: IUserObject
  referrer: IUserObject
  earnings: number
}

export interface IReferralLeaderboard {
  user: IUserObject
  earnings: number
}

export interface IReferralService {
  _calcAmountEarn(
    type: ReferralTypes,
    amount: number
  ): Promise<{ earn: number; rate: number }>

  create(
    type: ReferralTypes,
    user: IUserObject,
    amount: number
  ): Promise<IReferralObject | undefined>

  fetchAll(filter: FilterQuery<IReferral>): Promise<IReferralObject[]>

  earnings(filter: FilterQuery<IReferral>): Promise<IReferralEarnings[]>

  leaderboard(filter: FilterQuery<IReferral>): Promise<IReferralLeaderboard[]>

  delete(filter: FilterQuery<IReferral>): Promise<IReferralObject>

  count(filter: FilterQuery<IReferral>): Promise<number>
}
