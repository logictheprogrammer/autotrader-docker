import type { IWithdrawalMethod } from '../withdrawalMethod/withdrawalMethod.interface'
import type { WithdrawalStatus } from './withdrawal.enum'
import type { UserAccount } from '../user/user.enum'
import { ICurrency } from '../currency/currency.interface'
import { IUser } from '../user/user.interface'
import { IBaseObject } from '@/util/interface'

export interface IWithdrawal extends IBaseObject {
  withdrawalMethod?: IWithdrawalMethod
  currency?: ICurrency
  user?: IUser
  account: UserAccount
  address: string
  status: WithdrawalStatus
  amount: number
  fee: number
}

export interface ICreateWithdrawal {
  account: UserAccount
  address: string
  withdrawalMethodId: string
  amount: number
}
