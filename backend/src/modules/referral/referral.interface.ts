import { ReferralTypes } from '@/modules/referral/referral.enum'
import { IUserObject } from '@/modules/user/user.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IReferralObject extends baseObjectInterface {
  rate: number
  type: ReferralTypes
  referrer: IUserObject
  user: IUserObject
  amount: number
}

// @ts-ignore
export interface IReferral extends baseModelInterface, IReferralObject {}

export interface IReferralEarnings {
  user: {
    username: string
    _id: ObjectId
    createdAt: Date
  }
  referrer: {
    username: string
    _id: ObjectId
  }
  earnings: number
}

export interface IReferralLeaderboard {
  user: {
    username: string
    _id: ObjectId
    createdAt: Date
  }
  earnings: number
}

export interface IReferralService {
  create(
    type: ReferralTypes,
    user: IUserObject,
    amount: number
  ): Promise<IReferralObject | undefined>

  fetchAll(filter: FilterQuery<IReferral>): Promise<IReferralObject[]>

  earnings(filter: FilterQuery<IReferral>): Promise<IReferralEarnings[]>

  leaderboard(filter: FilterQuery<IReferral>): Promise<IReferralLeaderboard[]>

  delete(filter: FilterQuery<IReferral>): Promise<IReferralObject>
}
