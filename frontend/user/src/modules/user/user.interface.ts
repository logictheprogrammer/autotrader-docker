import type { UserRole, UserStatus } from './user.enum'

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
