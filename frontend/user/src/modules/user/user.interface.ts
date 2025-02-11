import { IBaseObject } from '@/util/interface'
import type { UserRole, UserStatus } from './user.enum'

export interface IUser extends IBaseObject {
  key: string
  email: string
  username: string
  name: string
  country: string
  role: UserRole
  status: UserStatus
  verified: Boolean
  referred: string
  refer: string
  profit: number
  mainBalance: number
  bonusBalance: number
  referralBalance: number
  demoBalance: number
}
