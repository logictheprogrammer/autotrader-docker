import { IBaseObject } from '@/util/interface'
import type { IDepositMethod } from '../depositMethod/depositMethod.interface'
import type { DepositStatus } from './deposit.enum'
import { ICurrency } from '../currency/currency.interface'
import { IUser } from '../user/user.interface'

export interface IDeposit extends IBaseObject {
  depositMethod?: IDepositMethod
  currency?: ICurrency
  user?: IUser
  status: DepositStatus
  amount: number
  fee: number
}

export interface ICreateDeposit {
  depositMethodId: string
  amount: number
}
