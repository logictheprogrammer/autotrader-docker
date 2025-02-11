import { IBaseObject } from '@/util/interface'
import { IUser } from '../user/user.interface'
import type { ReferralTypes } from './referral.enum'

export interface IReferralEarning extends IBaseObject {
  rate: number
  type: ReferralTypes
  referrer: IUser
  user: IUser
  amount: number
}

export interface IReferredUser {
  _id: string
  username: string
  name: string
  country: string
  createdAt: string
}

export interface IActiveReferral {
  user: {
    username: string
    _id: string
    createdAt: Date
  }
  referrer: string
  earnings: number
}
