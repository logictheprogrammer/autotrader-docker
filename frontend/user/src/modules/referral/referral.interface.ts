import type { ReferralTypes } from './referral.enum'

export interface IReferral {
  __v: number
  _id: string
  updatedAt: string
  createdAt: string
  rate: number
  type: ReferralTypes
  referrer: string
  user: {
    _id: string
    username: string
    isDeleted: boolean
  }
  amount: number
}

export interface IReferralUsers {
  user: {
    username: string
    _id: string
    createdAt: Date
  }
  referrer: string
  earnings: number
}
