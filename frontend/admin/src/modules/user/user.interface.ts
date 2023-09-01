import type { UserAccount, UserRole, UserStatus } from './user.enum'

export interface IUser {
  _id: string
  key: string
  email: string
  username: string
  name: string
  country: string
  role: UserRole
  status: UserStatus
  verifield: Boolean
  referred: string
  refer: string
  mainBalance: number
  bonusBalance: number
  referralBalance: number
  demoBalance: number
  updatedAt: string
  createdAt: string
}

export interface IUpdateUserProfile {
  userId: string
  name: string
  username: string
}

export interface IUpdateUserEmail {
  userId: string
  email: string
}

export interface IFundUserAccount {
  account: UserAccount
  amount: number
}
